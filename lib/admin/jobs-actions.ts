"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { buildRevisedContent } from "./generate";
import { runAutomatedChecks } from "./review-check";

const GenerateSchema = z.object({
  draftId: z.string().trim().min(1),
});

/**
 * 却下・修正依頼コメントを踏まえた再生成（research→generate→reviewの3ジョブを
 * 1つのServer Action内で同期的に実行する）。research/generate/reviewは
 * DB読み書きのみでLLM呼び出しも外部通信もないため、publish_jobsのような
 * pg_net非同期処理は使わず、この関数内でpending→succeeded/failedまで完結させる。
 */
export async function runGenerateFromComments(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const parsed = GenerateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { draftId } = parsed.data;

  const supabase = await createClient();

  const { data: draft, error: draftError } = await supabase
    .from("drafts")
    .select("content_type")
    .eq("id", draftId)
    .single();
  if (draftError || !draft) throw new Error(`下書きの取得に失敗しました: ${draftError?.message}`);

  const { data: latestVersion, error: versionError } = await supabase
    .from("draft_versions")
    .select("id, title, body_markdown, seo_title, seo_description, faq, cta_label, cta_href, version_number")
    .eq("draft_id", draftId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();
  if (versionError || !latestVersion) throw new Error(`最新バージョンの取得に失敗しました: ${versionError?.message}`);

  const { data: comments, error: commentsError } = await supabase
    .from("review_comments")
    .select("comment_type, body")
    .eq("draft_id", draftId)
    .in("comment_type", ["revision", "rejection"])
    .order("created_at", { ascending: false });
  if (commentsError) throw new Error(`コメントの取得に失敗しました: ${commentsError.message}`);

  const { error: researchJobError } = await supabase.from("job_runs").insert({
    draft_id: draftId,
    draft_version_id: latestVersion.id,
    kind: "research",
    status: "succeeded",
    input: { draftId },
    output: { commentsCount: comments?.length ?? 0 },
    created_by: staff.id,
    processed_at: new Date().toISOString(),
  });
  if (researchJobError) throw new Error(`researchジョブの記録に失敗しました: ${researchJobError.message}`);

  const generated = buildRevisedContent(latestVersion, comments ?? []);

  const { data: newVersion, error: newVersionError } = await supabase
    .from("draft_versions")
    .insert({
      draft_id: draftId,
      version_number: latestVersion.version_number + 1,
      title: generated.title,
      body_markdown: generated.body_markdown,
      seo_title: generated.seo_title,
      seo_description: generated.seo_description,
      faq: generated.faq,
      cta_label: generated.cta_label,
      cta_href: generated.cta_href,
      generated_by: "rule_based",
      created_by: staff.id,
    })
    .select("id")
    .single();

  if (newVersionError || !newVersion) {
    await supabase.from("job_runs").insert({
      draft_id: draftId,
      draft_version_id: latestVersion.id,
      kind: "generate",
      status: "failed",
      input: { comments },
      error_message: newVersionError?.message ?? "unknown error",
      created_by: staff.id,
      processed_at: new Date().toISOString(),
    });
    throw new Error(`再生成バージョンの保存に失敗しました: ${newVersionError?.message}`);
  }

  const { error: draftUpdateError } = await supabase.from("drafts").update({ status: "draft" }).eq("id", draftId);
  if (draftUpdateError) throw new Error(`下書きステータスの更新に失敗しました: ${draftUpdateError.message}`);

  const { error: generateJobError } = await supabase.from("job_runs").insert({
    draft_id: draftId,
    draft_version_id: latestVersion.id,
    result_draft_version_id: newVersion.id,
    kind: "generate",
    status: "succeeded",
    input: { comments },
    output: { newVersionId: newVersion.id },
    created_by: staff.id,
    processed_at: new Date().toISOString(),
  });
  if (generateJobError) throw new Error(`generateジョブの記録に失敗しました: ${generateJobError.message}`);

  const checkResult = runAutomatedChecks(draft.content_type, generated);
  const { error: reviewJobError } = await supabase.from("job_runs").insert({
    draft_id: draftId,
    draft_version_id: newVersion.id,
    result_draft_version_id: newVersion.id,
    kind: "review",
    status: "succeeded",
    output: checkResult,
    created_by: staff.id,
    processed_at: new Date().toISOString(),
  });
  if (reviewJobError) throw new Error(`reviewジョブの記録に失敗しました: ${reviewJobError.message}`);

  revalidatePath("/admin/drafts");
  revalidatePath(`/admin/drafts/${draftId}`);
  redirect(`/admin/drafts/${draftId}?generated=1`);
}

const ReviewCheckSchema = z.object({
  draftId: z.string().trim().min(1),
  draftVersionId: z.string().trim().min(1),
});

/** 生成直後だけでなく手動編集後のバージョンにも独立して使える自動チェック。 */
export async function runReviewCheck(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const parsed = ReviewCheckSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { draftId, draftVersionId } = parsed.data;

  const supabase = await createClient();

  const { data: draft, error: draftError } = await supabase
    .from("drafts")
    .select("content_type")
    .eq("id", draftId)
    .single();
  if (draftError || !draft) throw new Error(`下書きの取得に失敗しました: ${draftError?.message}`);

  const { data: version, error: versionError } = await supabase
    .from("draft_versions")
    .select("body_markdown, seo_title, seo_description, faq, cta_label, cta_href")
    .eq("id", draftVersionId)
    .single();
  if (versionError || !version) throw new Error(`バージョンの取得に失敗しました: ${versionError?.message}`);

  const checkResult = runAutomatedChecks(draft.content_type, version);

  const { error: reviewJobError } = await supabase.from("job_runs").insert({
    draft_id: draftId,
    draft_version_id: draftVersionId,
    result_draft_version_id: draftVersionId,
    kind: "review",
    status: "succeeded",
    output: checkResult,
    created_by: staff.id,
    processed_at: new Date().toISOString(),
  });
  if (reviewJobError) throw new Error(`reviewジョブの記録に失敗しました: ${reviewJobError.message}`);

  revalidatePath(`/admin/drafts/${draftId}`);
}
