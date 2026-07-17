"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { slugify } from "./slug";

const CONTENT_TYPES = ["article", "service_page", "cta_copy", "faq", "landing_page", "other"] as const;

const DraftVersionSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です"),
  body_markdown: z.string().trim().optional().default(""),
  seo_title: z.string().trim().optional().default(""),
  seo_description: z.string().trim().optional().default(""),
  faq: z.string().trim().optional().default(""),
  cta_label: z.string().trim().optional().default(""),
  cta_href: z.string().trim().optional().default(""),
});

/**
 * draftIdは.bind()で渡さずhidden inputでFormDataに含める。
 * .bind()で束縛したidと日本語を含むrevalidatePath()を組み合わせると
 * Next.js側でByteString変換エラーが起きる不具合を過去に踏んだため
 * （works-actions.ts / articles-actions.tsと同じ対策）。
 */
const DraftVersionWithIdSchema = DraftVersionSchema.extend({
  draftId: z.string().trim().min(1),
});

const CreateDraftSchema = DraftVersionSchema.extend({
  content_type: z.enum(CONTENT_TYPES),
  target_path: z.string().trim().optional().default(""),
});

/**
 * "Q: 質問\nA: 回答" のペアを空行区切りで並べた簡易フォーマットをパースする。
 * lib/admin/articles-actions.ts の parseFaq() と同じ仕様（表記を統一するため）。
 */
function parseFaq(raw: string): { question: string; answer: string }[] {
  if (!raw.trim()) return [];
  const blocks = raw.split(/\n\s*\n/);
  const faq: { question: string; answer: string }[] = [];
  for (const block of blocks) {
    const qMatch = block.match(/Q[:：]\s*(.+)/);
    const aMatch = block.match(/A[:：]\s*([\s\S]+)/);
    if (qMatch && aMatch) {
      faq.push({ question: qMatch[1].trim(), answer: aMatch[1].trim() });
    }
  }
  return faq;
}

export type DraftActionState = { error?: string } | undefined;

/** 新規下書きを作成する（drafts行 + draft_versions v1）。生成元は現状すべて手動入力（generated_by: 'manual'）。 */
export async function createDraft(_prev: DraftActionState, formData: FormData): Promise<DraftActionState> {
  const staff = await requireStaff();

  const parsed = CreateDraftSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" / ") };
  }
  const data = parsed.data;
  const supabase = await createClient();

  const { data: draft, error: draftError } = await supabase
    .from("drafts")
    .insert({
      content_type: data.content_type,
      target_path: data.target_path || null,
      title: data.title,
      status: "draft",
      created_by: staff.id,
    })
    .select("id")
    .single();

  if (draftError || !draft) {
    return { error: `下書きの作成に失敗しました: ${draftError?.message}` };
  }

  const { error: versionError } = await supabase.from("draft_versions").insert({
    draft_id: draft.id,
    version_number: 1,
    title: data.title,
    body_markdown: data.body_markdown,
    seo_title: data.seo_title || null,
    seo_description: data.seo_description || null,
    faq: parseFaq(data.faq),
    cta_label: data.cta_label || null,
    cta_href: data.cta_href || null,
    generated_by: "manual",
    created_by: staff.id,
  });

  if (versionError) {
    return { error: `下書き本文の保存に失敗しました: ${versionError.message}` };
  }

  revalidatePath("/admin/drafts");
  redirect(`/admin/drafts/${draft.id}?saved=1`);
}

/**
 * 修正依頼(needs_revision)を受けた下書きに新しいバージョンを追加する。
 * 追加すると自動的にステータスをdraftへ戻し、再レビュー待ちにする。
 */
export async function addDraftVersion(_prev: DraftActionState, formData: FormData): Promise<DraftActionState> {
  const staff = await requireStaff();

  const parsed = DraftVersionWithIdSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" / ") };
  }
  const { draftId, ...data } = parsed.data;
  const supabase = await createClient();

  const { data: latest } = await supabase
    .from("draft_versions")
    .select("version_number")
    .eq("draft_id", draftId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextVersion = (latest?.version_number ?? 0) + 1;

  const { error: versionError } = await supabase.from("draft_versions").insert({
    draft_id: draftId,
    version_number: nextVersion,
    title: data.title,
    body_markdown: data.body_markdown,
    seo_title: data.seo_title || null,
    seo_description: data.seo_description || null,
    faq: parseFaq(data.faq),
    cta_label: data.cta_label || null,
    cta_href: data.cta_href || null,
    generated_by: "manual",
    created_by: staff.id,
  });

  if (versionError) {
    return { error: `新バージョンの保存に失敗しました: ${versionError.message}` };
  }

  const { error: draftError } = await supabase
    .from("drafts")
    .update({ title: data.title, status: "draft" })
    .eq("id", draftId);

  if (draftError) {
    return { error: `下書きステータスの更新に失敗しました: ${draftError.message}` };
  }

  revalidatePath("/admin/drafts");
  revalidatePath(`/admin/drafts/${draftId}`);
  redirect(`/admin/drafts/${draftId}?saved=1`);
}

const ReviewSchema = z.object({
  draftId: z.string().trim().min(1),
  decision: z.enum(["approve", "revise", "reject"]),
  comment: z.string().trim().optional().default(""),
  draftVersionId: z.string().trim().optional().default(""),
});

export type ReviewActionState = { error?: string } | undefined;

/**
 * 承認/修正依頼/却下を確定する。修正依頼・却下はコメント必須
 * （次回生成・NGパターン抽出に使うため空コメントを許可しない）。
 *
 * 承認(approve)時の公開方法はcontent_typeで分岐する:
 *   - article: 既存のarticlesテーブルへ直接insertし即座に公開する
 *     （/columnはSupabaseから動的描画されるCMSデータのためGit不要）。
 *   - それ以外(service_page等、実コード変更が必要な種別): publish_jobsへ
 *     ジョブを積むのみ。実際のGit pushはSupabase側のpg_netトリガーが
 *     app/api/jobs/process-publish を非同期に叩いて行う
 *     （0008_publish_jobs.sql参照）。ここではジョブ登録までしか行わない。
 */
export async function reviewDraft(_prev: ReviewActionState, formData: FormData): Promise<ReviewActionState> {
  const staff = await requireStaff();

  const parsed = ReviewSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" / ") };
  }
  const { draftId, decision, comment, draftVersionId } = parsed.data;

  if (decision !== "approve" && !comment) {
    return { error: "修正依頼・却下の場合はコメントの入力が必須です。" };
  }

  const supabase = await createClient();

  if (decision === "approve") {
    const { data: draft, error: draftFetchError } = await supabase
      .from("drafts")
      .select("content_type, target_path")
      .eq("id", draftId)
      .single();
    if (draftFetchError || !draft) {
      return { error: `下書きの取得に失敗しました: ${draftFetchError?.message}` };
    }

    if (draft.content_type === "article") {
      const { data: version, error: versionError } = await supabase
        .from("draft_versions")
        .select("title, body_markdown, seo_title, seo_description, faq")
        .eq("id", draftVersionId)
        .single();
      if (versionError || !version) {
        return { error: `バージョンの取得に失敗しました: ${versionError?.message}` };
      }

      const { error: articleError } = await supabase.from("articles").insert({
        slug: slugify(version.title),
        title: version.title,
        body_markdown: version.body_markdown,
        seo_title: version.seo_title,
        seo_description: version.seo_description,
        faq: version.faq,
        status: "published",
        published_at: new Date().toISOString(),
      });
      if (articleError) {
        return { error: `記事の公開に失敗しました: ${articleError.message}` };
      }

      const { error: draftUpdateError } = await supabase.from("drafts").update({ status: "published" }).eq("id", draftId);
      if (draftUpdateError) {
        return { error: `下書きステータスの更新に失敗しました: ${draftUpdateError.message}` };
      }

      revalidatePath("/admin/drafts");
      revalidatePath(`/admin/drafts/${draftId}`);
      revalidatePath("/column");
      redirect(`/admin/drafts/${draftId}?reviewed=1`);
    }

    if (!draft.target_path) {
      return { error: "この種別を承認するには「想定パス」の入力が必須です（下書き作成画面で設定してください）。" };
    }

    const { error: draftUpdateError } = await supabase.from("drafts").update({ status: "approved" }).eq("id", draftId);
    if (draftUpdateError) {
      return { error: `下書きステータスの更新に失敗しました: ${draftUpdateError.message}` };
    }

    const { error: jobError } = await supabase.from("publish_jobs").insert({
      draft_id: draftId,
      draft_version_id: draftVersionId,
      target_path: draft.target_path,
      created_by: staff.id,
    });
    if (jobError) {
      return { error: `公開ジョブの登録に失敗しました: ${jobError.message}` };
    }

    if (comment) {
      await supabase.from("review_comments").insert({
        draft_id: draftId,
        draft_version_id: draftVersionId || null,
        comment_type: "approval_note",
        body: comment,
        created_by: staff.id,
      });
    }

    revalidatePath("/admin/drafts");
    revalidatePath(`/admin/drafts/${draftId}`);
    redirect(`/admin/drafts/${draftId}?reviewed=1`);
  }

  const statusMap = { revise: "needs_revision", reject: "rejected" } as const;
  const commentTypeMap = { revise: "revision", reject: "rejection" } as const;

  const { error: draftError } = await supabase
    .from("drafts")
    .update({ status: statusMap[decision] })
    .eq("id", draftId);

  if (draftError) {
    return { error: `ステータス更新に失敗しました: ${draftError.message}` };
  }

  const { error: commentError } = await supabase.from("review_comments").insert({
    draft_id: draftId,
    draft_version_id: draftVersionId || null,
    comment_type: commentTypeMap[decision],
    body: comment,
    created_by: staff.id,
  });
  if (commentError) {
    return { error: `コメントの保存に失敗しました: ${commentError.message}` };
  }

  revalidatePath("/admin/drafts");
  revalidatePath(`/admin/drafts/${draftId}`);
  redirect(`/admin/drafts/${draftId}?reviewed=1`);
}

const RetryPublishSchema = z.object({
  draftId: z.string().trim().min(1),
  draftVersionId: z.string().trim().min(1),
  targetPath: z.string().trim().min(1),
});

/**
 * 失敗したpublish_jobsを再試行する。既存行を書き換えず新しい行をINSERTする
 * （INSERTのたびにpg_netトリガーが起動する仕組みのため、UPDATEでは再処理されない。
 * 履歴としても、各試行を独立した行として残す方が監査しやすい）。
 */
export async function retryPublishJob(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const parsed = RetryPublishSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { draftId, draftVersionId, targetPath } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("publish_jobs").insert({
    draft_id: draftId,
    draft_version_id: draftVersionId,
    target_path: targetPath,
    created_by: staff.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/drafts/${draftId}`);
}
