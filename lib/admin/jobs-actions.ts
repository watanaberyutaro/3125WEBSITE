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

const GENERATE_WITH_AI_CONTENT_TYPES = ["article", "service_page"] as const;

const GenerateWithAISchema = z
  .object({
    content_type: z.enum(GENERATE_WITH_AI_CONTENT_TYPES),
    topic: z.string().trim().min(1, "テーマは必須です"),
    target_path: z.string().trim().optional().default(""),
  })
  .refine((data) => data.content_type !== "service_page" || data.target_path, {
    message: "service_pageの場合は公開先パスの入力が必須です",
    path: ["target_path"],
  });

export type GenerateWithAIState = { error?: string } | undefined;

/**
 * トピックからAI Gateway(ローカルLLM)経由で下書きを新規生成する。
 * この関数自体はdraftsとjob_runs(status='pending')を挿入するだけで即座に
 * returnする — 実際の生成は0010_llm_generate_trigger.sqlのpg_netトリガーが
 * app/api/jobs/process-generate/route.tsを非同期に起動して行う
 * （AI Gatewayの応答が数十秒〜300秒近くかかるため、Server Action内で
 * 同期的に待つとブラウザをブロックしてしまう）。
 *
 * content_typeをarticle/service_pageのみに絞るのは、Phase5で確立した
 * 「まだ描画面がないcta_copy等はreviewDraftの承認時点でブロックする」という
 * 境界と整合させるため（生成できても承認できないものを作らせない）。
 */
export async function runGenerateWithAI(
  _prev: GenerateWithAIState,
  formData: FormData,
): Promise<GenerateWithAIState> {
  const staff = await requireStaff();

  const parsed = GenerateWithAISchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" / ") };
  }
  const { content_type, topic, target_path } = parsed.data;

  const supabase = await createClient();

  const { data: draft, error: draftError } = await supabase
    .from("drafts")
    .insert({
      content_type,
      target_path: target_path || null,
      title: topic,
      status: "draft",
      created_by: staff.id,
    })
    .select("id")
    .single();

  if (draftError || !draft) {
    return { error: `下書きの作成に失敗しました: ${draftError?.message}` };
  }

  const { error: jobError } = await supabase.from("job_runs").insert({
    draft_id: draft.id,
    kind: "generate",
    status: "pending",
    input: { source: "llm", topic, content_type },
    created_by: staff.id,
  });

  if (jobError) {
    return { error: `生成ジョブの登録に失敗しました: ${jobError.message}` };
  }

  revalidatePath("/admin/drafts");
  redirect(`/admin/drafts/${draft.id}?generating=1`);
}

const RetryGenerateSchema = z.object({
  draftId: z.string().trim().min(1),
  topic: z.string().trim().min(1),
  contentType: z.enum(GENERATE_WITH_AI_CONTENT_TYPES),
});

/**
 * 失敗した、またはprocessingのまま詰まったAI生成ジョブを再試行する。
 * retryPublishJob(drafts-actions.ts)と同じ理由で、既存行を書き換えず
 * 新しいjob_runs行をINSERTする（INSERTのたびにpg_netトリガーが起動するため、
 * UPDATEでは再処理されない）。
 */
export async function retryGenerateJob(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const parsed = RetryGenerateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { draftId, topic, contentType } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("job_runs").insert({
    draft_id: draftId,
    kind: "generate",
    status: "pending",
    input: { source: "llm", topic, content_type: contentType },
    created_by: staff.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/drafts/${draftId}`);
}

const RegenerateWithAISchema = z.object({
  draftId: z.string().trim().min(1),
});

/**
 * Phase4のruleGenerateFromComments(ルールベース、チェックリスト貼り付けのみ)の
 * LLM版。既存下書きの最新バージョン+review_comments(revision/rejection)を
 * process-generate/route.tsのmode='revise'で踏まえさせ、実際に本文を
 * 書き直させる。needs_revisionの下書きにのみ許可する
 * （RegenerateFromCommentsButtonと同じ表示条件）。
 */
export async function runRegenerateWithAI(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const parsed = RegenerateWithAISchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { draftId } = parsed.data;

  const supabase = await createClient();

  const { data: draft, error: draftError } = await supabase
    .from("drafts")
    .select("content_type, status")
    .eq("id", draftId)
    .single();
  if (draftError || !draft) throw new Error(`下書きの取得に失敗しました: ${draftError?.message}`);
  if (draft.status !== "needs_revision") throw new Error("修正依頼中の下書きのみAIで書き直せます。");
  if (!(GENERATE_WITH_AI_CONTENT_TYPES as readonly string[]).includes(draft.content_type)) {
    throw new Error("この種別はまだAI書き直しに対応していません（対応済み: article, service_page）。");
  }

  const { error: jobError } = await supabase.from("job_runs").insert({
    draft_id: draftId,
    kind: "generate",
    status: "pending",
    input: { source: "llm", content_type: draft.content_type, mode: "revise" },
    created_by: staff.id,
  });
  if (jobError) throw new Error(`生成ジョブの登録に失敗しました: ${jobError.message}`);

  revalidatePath(`/admin/drafts/${draftId}`);
}
