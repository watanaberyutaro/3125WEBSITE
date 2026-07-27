"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { callDeepSeekChat } from "@/lib/ai/deepseek";
import { buildTopicIdeaSystemPrompt, parseTopicIdeas, TOPIC_IDEA_USER_PROMPT } from "./topic-ideas";

const EXCLUDE_TITLES_LIMIT = 200;

/**
 * 記事ネタ(タイトル+概要)をAIに提案させ、article_topic_ideasへpendingとして
 * 保存する。improvement_suggestions(Phase8)と同じく、staffが押した時だけ
 * 実行される単発のServer Action内呼び出し(DeepSeekの応答は実測で数秒〜
 * 十数秒のため、job_runs/pg_netの非同期経路は使わずブロッキング呼び出しで
 * 済ませる)。公開済み記事タイトル+未消化(pending/used)の企画タイトルを
 * 「避けるべきリスト」として渡すことで重複を防ぐ。
 */
export async function generateTopicIdeas(): Promise<void> {
  const staff = await requireStaff();
  const supabase = await createClient();

  const [
    { data: articles, error: articlesError },
    { data: existingIdeas, error: ideasError },
    { data: rules, error: rulesError },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("title")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(EXCLUDE_TITLES_LIMIT),
    supabase
      .from("article_topic_ideas")
      .select("title")
      .neq("status", "dismissed")
      .order("created_at", { ascending: false })
      .limit(EXCLUDE_TITLES_LIMIT),
    supabase
      .from("rejection_rules")
      .select("rule_text")
      .eq("content_type", "article")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  if (articlesError) throw new Error(`公開済み記事の取得に失敗しました: ${articlesError.message}`);
  if (ideasError) throw new Error(`既存の記事ネタの取得に失敗しました: ${ideasError.message}`);
  if (rulesError) throw new Error(`改善ルールの取得に失敗しました: ${rulesError.message}`);

  const excludeTitles = [...(articles ?? []).map((a) => a.title), ...(existingIdeas ?? []).map((i) => i.title)];

  const systemPrompt = buildTopicIdeaSystemPrompt(excludeTitles, (rules ?? []).map((r) => r.rule_text));
  const raw = await callDeepSeekChat(systemPrompt, TOPIC_IDEA_USER_PROMPT, { timeoutMs: 60_000 });
  const ideas = parseTopicIdeas(raw);
  if (ideas.length === 0) throw new Error("AIの応答から記事ネタを取得できませんでした。");

  const { error: insertError } = await supabase.from("article_topic_ideas").insert(
    ideas.map((idea) => ({
      title: idea.title,
      brief: idea.brief,
      status: "pending",
      created_by: staff.id,
    })),
  );
  if (insertError) throw new Error(`記事ネタの保存に失敗しました: ${insertError.message}`);

  revalidatePath("/admin/article-ideas");
}

const CreateArticleFromIdeaSchema = z.object({
  ideaId: z.string().trim().min(1),
});

/**
 * 選んだ記事ネタから、そのままAI記事生成ジョブを起動する。
 * runGenerateWithAI(jobs-actions.ts)と同じdrafts+job_runsの挿入パターンだが、
 * topicをフォーム入力ではなく選択済みのidea.title/briefから組み立てる点のみ異なる。
 * 生成先はarticleに固定（記事ネタ機能はNEWS記事専用のため、service_pageの
 * 公開先パス入力のような分岐は不要）。
 */
export async function createArticleFromIdea(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const parsed = CreateArticleFromIdeaSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { ideaId } = parsed.data;

  const supabase = await createClient();

  const { data: idea, error: ideaError } = await supabase
    .from("article_topic_ideas")
    .select("title, brief, status")
    .eq("id", ideaId)
    .single();
  if (ideaError || !idea) throw new Error(`記事ネタの取得に失敗しました: ${ideaError?.message}`);
  if (idea.status !== "pending") throw new Error("この記事ネタは既に使用済み、または却下済みです。");

  const topic = `${idea.title}\n\n${idea.brief}`;

  const { data: draft, error: draftError } = await supabase
    .from("drafts")
    .insert({
      content_type: "article",
      title: idea.title,
      status: "draft",
      created_by: staff.id,
    })
    .select("id")
    .single();
  if (draftError || !draft) throw new Error(`下書きの作成に失敗しました: ${draftError?.message}`);

  const { error: jobError } = await supabase.from("job_runs").insert({
    draft_id: draft.id,
    kind: "generate",
    status: "pending",
    input: { source: "llm", topic, content_type: "article" },
    created_by: staff.id,
  });
  if (jobError) throw new Error(`生成ジョブの登録に失敗しました: ${jobError.message}`);

  const { error: ideaUpdateError } = await supabase
    .from("article_topic_ideas")
    .update({ status: "used", used_draft_id: draft.id })
    .eq("id", ideaId);
  if (ideaUpdateError) throw new Error(`記事ネタの更新に失敗しました: ${ideaUpdateError.message}`);

  revalidatePath("/admin/article-ideas");
  revalidatePath("/admin/drafts");
  redirect(`/admin/drafts/${draft.id}?generating=1`);
}

const DismissTopicIdeaSchema = z.object({
  ideaId: z.string().trim().min(1),
});

export async function dismissTopicIdea(formData: FormData): Promise<void> {
  await requireStaff();
  const parsed = DismissTopicIdeaSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" / "));
  const { ideaId } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("article_topic_ideas").update({ status: "dismissed" }).eq("id", ideaId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/article-ideas");
}
