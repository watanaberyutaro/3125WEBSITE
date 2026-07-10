"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { slugify } from "./slug";

const ArticleSchema = z.object({
  slug: z.string().trim().optional().default(""),
  title: z.string().trim().min(1, "タイトルは必須です"),
  excerpt: z.string().trim().optional().default(""),
  body_markdown: z.string().trim().optional().default(""),
  category_id: z.string().trim().min(1, "カテゴリを選択してください"),
  cover_image_path: z.string().trim().optional().default(""),
  og_image_path: z.string().trim().optional().default(""),
  source_link: z.string().trim().optional().default(""),
  tags: z.string().trim().optional().default(""),
  faq: z.string().trim().optional().default(""),
  status: z.enum(["draft", "published"]),
  seo_title: z.string().trim().optional().default(""),
  seo_description: z.string().trim().optional().default(""),
  reading_minutes: z.coerce.number().int().min(1).default(3),
});

function parseTagNames(raw: string): string[] {
  return raw
    .split(/[,、]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * "Q: 質問\nA: 回答" のペアを空行区切りで並べた簡易フォーマットをパースする。
 * 例:
 *   Q: 導入にどれくらいかかりますか？
 *   A: 通常1〜2ヶ月です。
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

/** タグ名の配列をtagsテーブルへupsertし、記事とのarticle_tags関連を張り替える。 */
async function syncArticleTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  articleId: string,
  tagNames: string[],
) {
  await supabase.from("article_tags").delete().eq("article_id", articleId);
  if (tagNames.length === 0) return;

  const tagIds: string[] = [];
  for (const name of tagNames) {
    const slug = slugify(name);
    const { data: existing } = await supabase.from("tags").select("id").eq("slug", slug).maybeSingle();
    if (existing) {
      tagIds.push(existing.id);
    } else {
      const { data: created, error } = await supabase.from("tags").insert({ name, slug }).select("id").single();
      if (error) throw new Error(error.message);
      tagIds.push(created.id);
    }
  }

  const { error } = await supabase
    .from("article_tags")
    .insert(tagIds.map((tag_id) => ({ article_id: articleId, tag_id })));
  if (error) throw new Error(error.message);
}

export type ArticleActionState = { error?: string } | undefined;

export async function createArticle(
  _prev: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  await requireStaff();

  const parsed = ArticleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" / ") };
  }
  const data = parsed.data;
  const slug = data.slug ? slugify(data.slug) : slugify(data.title);

  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from("articles")
    .insert({
      slug,
      title: data.title,
      excerpt: data.excerpt || null,
      body_markdown: data.body_markdown,
      category_id: data.category_id,
      cover_image_path: data.cover_image_path || null,
      og_image_path: data.og_image_path || null,
      source_link: data.source_link || null,
      faq: parseFaq(data.faq),
      status: data.status,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      reading_minutes: data.reading_minutes,
      published_at: data.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: `保存に失敗しました: ${error?.message}` };
  }

  try {
    await syncArticleTags(supabase, created.id, parseTagNames(data.tags));
  } catch (e) {
    return { error: `タグの保存に失敗しました: ${(e as Error).message}` };
  }

  revalidatePath("/admin/articles");
  revalidatePath("/column");
  redirect("/admin/articles?saved=1");
}

export async function updateArticle(
  _prev: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  await requireStaff();

  const id = String(formData.get("id") ?? "");
  const parsed = ArticleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" / ") };
  }
  const data = parsed.data;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("articles")
    .select("slug, published_at")
    .eq("id", id)
    .single();
  const slug = data.slug
    ? slugify(data.slug)
    : existing?.slug
      ? slugify(existing.slug)
      : slugify(data.title);
  const publishedAt =
    data.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : existing?.published_at;

  const { error } = await supabase
    .from("articles")
    .update({
      slug,
      title: data.title,
      excerpt: data.excerpt || null,
      body_markdown: data.body_markdown,
      category_id: data.category_id,
      cover_image_path: data.cover_image_path || null,
      og_image_path: data.og_image_path || null,
      source_link: data.source_link || null,
      faq: parseFaq(data.faq),
      status: data.status,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      reading_minutes: data.reading_minutes,
      published_at: publishedAt,
    })
    .eq("id", id);

  if (error) {
    return { error: `更新に失敗しました: ${error.message}` };
  }

  try {
    await syncArticleTags(supabase, id, parseTagNames(data.tags));
  } catch (e) {
    return { error: `タグの保存に失敗しました: ${(e as Error).message}` };
  }

  revalidatePath("/admin/articles");
  revalidatePath("/column");
  revalidatePath(`/column/${slug}`);
  redirect("/admin/articles?saved=1");
}

export async function deleteArticle(id: string): Promise<void> {
  await requireStaff();
  const supabase = await createClient();
  const { data: article } = await supabase.from("articles").select("slug").eq("id", id).single();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/articles");
  revalidatePath("/column");
  if (article?.slug) revalidatePath(`/column/${article.slug}`);
}
