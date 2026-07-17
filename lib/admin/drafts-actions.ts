"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";

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
 * 承認後の実際のGit push処理はフェーズ3で実装する（ここではstatus更新のみ）。
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

  const statusMap = { approve: "approved", revise: "needs_revision", reject: "rejected" } as const;
  const commentTypeMap = { approve: "approval_note", revise: "revision", reject: "rejection" } as const;

  const { error: draftError } = await supabase
    .from("drafts")
    .update({ status: statusMap[decision] })
    .eq("id", draftId);

  if (draftError) {
    return { error: `ステータス更新に失敗しました: ${draftError.message}` };
  }

  if (comment) {
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
  }

  revalidatePath("/admin/drafts");
  revalidatePath(`/admin/drafts/${draftId}`);
  redirect(`/admin/drafts/${draftId}?reviewed=1`);
}
