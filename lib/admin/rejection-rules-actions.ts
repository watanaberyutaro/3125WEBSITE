"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { callDeepSeekChat } from "@/lib/ai/deepseek";

const PROMOTE_SYSTEM_PROMPT =
  "あなたはコンテンツ品質管理のアシスタントです。与えられた却下・修正依頼コメントを、今後の生成AIへの指示として再利用できる一般化されたルールに変換してください。特定の下書きの内容やタイトルへの言及は避け、汎用的な注意点として1〜2文で簡潔にまとめてください。ルール文のみを出力してください（前置き・説明文は不要）。";

const PromoteSchema = z.object({
  reviewCommentId: z.string().trim().min(1),
});

/**
 * 個別のreview_commentsを、以降の全生成に反映される汎用ルールへ変換する。
 * staffが明示的にボタンを押した時だけ呼ばれる（悪いルールが黙って混入する
 * リスクを避けるため、自動抽出はしない）。却下済み(terminal)の下書きの
 * コメントでも呼び出し可能（rejection_rulesが本来失われる知見を拾う場所）。
 */
export async function promoteReviewCommentToRule(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const parsed = PromoteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { reviewCommentId } = parsed.data;

  const supabase = await createClient();

  const { data: comment, error: commentError } = await supabase
    .from("review_comments")
    .select("body, draft_id, drafts(content_type)")
    .eq("id", reviewCommentId)
    .single();
  if (commentError || !comment) throw new Error(`コメントの取得に失敗しました: ${commentError?.message}`);

  const contentType = comment.drafts?.content_type;
  if (contentType !== "article" && contentType !== "service_page") {
    throw new Error("この種別のコメントはルール化に対応していません（article/service_pageのみ）。");
  }

  const ruleText = await callDeepSeekChat(PROMOTE_SYSTEM_PROMPT, comment.body, { timeoutMs: 30_000 });

  const { error: insertError } = await supabase.from("rejection_rules").insert({
    content_type: contentType,
    rule_text: ruleText.trim(),
    source_review_comment_id: reviewCommentId,
    created_by: staff.id,
  });
  if (insertError) throw new Error(`ルールの保存に失敗しました: ${insertError.message}`);

  revalidatePath(`/admin/drafts/${comment.draft_id}`);
  revalidatePath("/admin/rejection-rules");
}

const ToggleSchema = z.object({
  id: z.string().trim().min(1),
  active: z.enum(["true", "false"]),
});

export async function toggleRejectionRuleActive(formData: FormData): Promise<void> {
  await requireStaff();
  const parsed = ToggleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { id, active } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("rejection_rules").update({ active: active === "true" }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/rejection-rules");
}

const DeleteSchema = z.object({
  id: z.string().trim().min(1),
});

export async function deleteRejectionRule(formData: FormData): Promise<void> {
  await requireStaff();
  const parsed = DeleteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { id } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("rejection_rules").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/rejection-rules");
}
