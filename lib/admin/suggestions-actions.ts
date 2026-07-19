"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { runAutomatedChecks } from "./review-check";
import {
  buildCheckableFromArticle,
  buildCheckableFromServicePageFrontmatter,
  buildSuggestionSystemPrompt,
} from "./suggestions";
import { parseFrontmatter } from "@/lib/content/frontmatter";
import { callDeepSeekChat } from "@/lib/ai/deepseek";

const SUGGESTION_TARGET_CONTENT_TYPES = ["article", "service_page"] as const;

const GenerateSuggestionSchema = z.object({
  draftId: z.string().trim().min(1),
});

/**
 * 公開済み(status='published')のarticle/service_pageに対して、機械的チェック
 * (runAutomatedChecks、Phase4)+ DeepSeekによる定性的な改善提案を1回生成する。
 * staffが個別に「生成する」を押した時だけ実行される(定期実行の全自動スキャンはしない)。
 *
 * articleは/admin/articles/[id]/editで手動編集され得るため、draft_versionsではなく
 * articlesテーブルのライブな内容を読む。service_pageにはこの手動編集経路が
 * 存在しないため、実際にGitへコミットされたcontent/services/*.mdを直接読む
 * (draft_versionsではなく実ファイルを正とする)。
 */
export async function generateSuggestion(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const parsed = GenerateSuggestionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { draftId } = parsed.data;

  const supabase = await createClient();

  const { data: draft, error: draftError } = await supabase
    .from("drafts")
    .select("content_type, target_path, status")
    .eq("id", draftId)
    .single();
  if (draftError || !draft) throw new Error(`下書きの取得に失敗しました: ${draftError?.message}`);
  if (draft.status !== "published") throw new Error("公開済みの下書きのみ改善提案を生成できます。");
  if (!(SUGGESTION_TARGET_CONTENT_TYPES as readonly string[]).includes(draft.content_type)) {
    throw new Error("この種別はまだ改善提案の対象外です（対応済み: article, service_page）。");
  }

  let title: string;
  let checkable: ReturnType<typeof buildCheckableFromArticle>;

  if (draft.content_type === "article") {
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("title, body_markdown, seo_title, seo_description, faq")
      .eq("source_draft_id", draftId)
      .maybeSingle();
    if (articleError || !article) throw new Error(`公開済み記事の取得に失敗しました: ${articleError?.message}`);
    title = article.title;
    checkable = buildCheckableFromArticle(article);
  } else {
    if (!draft.target_path) throw new Error("公開先パスが設定されていません。");
    const slug = draft.target_path.replace(/^content\/services\//, "").replace(/\.md$/, "");
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("公開先パスの形式が想定外です。");
    const raw = await readFile(path.join(process.cwd(), "content/services", `${slug}.md`), "utf-8").catch(() => null);
    if (!raw) throw new Error("公開先のファイルが見つかりませんでした。");
    const parsedFile = parseFrontmatter(raw);
    if (!parsedFile) throw new Error("公開先ファイルのフロントマターを解析できませんでした。");
    title = parsedFile.frontmatter.title;
    checkable = buildCheckableFromServicePageFrontmatter(parsedFile.frontmatter, parsedFile.body);
  }

  const issues = runAutomatedChecks(draft.content_type, checkable).issues;

  const { data: rules } = await supabase
    .from("rejection_rules")
    .select("rule_text")
    .eq("content_type", draft.content_type)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const suggestionText = await callDeepSeekChat(
    buildSuggestionSystemPrompt((rules ?? []).map((r) => r.rule_text)),
    `タイトル: ${title}\n\n本文:\n${checkable.body_markdown}`,
    { timeoutMs: 30_000 },
  );

  const { error: insertError } = await supabase.from("improvement_suggestions").insert({
    draft_id: draftId,
    issues,
    suggestion_text: suggestionText.trim(),
    created_by: staff.id,
  });
  if (insertError) throw new Error(`改善提案の保存に失敗しました: ${insertError.message}`);

  revalidatePath("/admin/improvement-suggestions");
}

const SendAsRevisionSchema = z.object({
  suggestionId: z.string().trim().min(1),
});

/**
 * 改善提案を修正依頼コメントとして送り、下書きをneeds_revisionへ戻す
 * （reviewDraftのrevise分岐と同じ状態遷移）。これにより既存のPhase7の
 * 「AIに指摘を踏まえて書き直させる」がそのまま使える。
 */
export async function sendSuggestionAsRevision(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const parsed = SendAsRevisionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { suggestionId } = parsed.data;

  const supabase = await createClient();

  const { data: suggestion, error: suggestionError } = await supabase
    .from("improvement_suggestions")
    .select("draft_id, suggestion_text")
    .eq("id", suggestionId)
    .single();
  if (suggestionError || !suggestion) throw new Error(`改善提案の取得に失敗しました: ${suggestionError?.message}`);

  const { data: draft, error: draftError } = await supabase
    .from("drafts")
    .select("status")
    .eq("id", suggestion.draft_id)
    .single();
  if (draftError || !draft) throw new Error(`下書きの取得に失敗しました: ${draftError?.message}`);
  if (draft.status !== "published") throw new Error("公開済みの下書きのみ修正依頼として送れます。");

  const { error: commentError } = await supabase.from("review_comments").insert({
    draft_id: suggestion.draft_id,
    comment_type: "revision",
    body: suggestion.suggestion_text ?? "",
    created_by: staff.id,
  });
  if (commentError) throw new Error(`コメントの保存に失敗しました: ${commentError.message}`);

  const { error: draftUpdateError } = await supabase
    .from("drafts")
    .update({ status: "needs_revision" })
    .eq("id", suggestion.draft_id);
  if (draftUpdateError) throw new Error(`下書きステータスの更新に失敗しました: ${draftUpdateError.message}`);

  const { error: suggestionUpdateError } = await supabase
    .from("improvement_suggestions")
    .update({ status: "actioned" })
    .eq("id", suggestionId);
  if (suggestionUpdateError) throw new Error(`改善提案の更新に失敗しました: ${suggestionUpdateError.message}`);

  revalidatePath("/admin/improvement-suggestions");
  revalidatePath(`/admin/drafts/${suggestion.draft_id}`);
}

const DismissSuggestionSchema = z.object({
  suggestionId: z.string().trim().min(1),
});

export async function dismissSuggestion(formData: FormData): Promise<void> {
  await requireStaff();
  const parsed = DismissSuggestionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { suggestionId } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("improvement_suggestions").update({ status: "dismissed" }).eq("id", suggestionId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/improvement-suggestions");
}
