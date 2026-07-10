import { createPublicClient } from "@/lib/supabase/public";
import { resolveImageUrl } from "@/lib/media";
import { renderArticleBody } from "./markdown";
import type { ArticleCategoryRef, ArticleDetail, ArticleListItem, ArticleTagRef } from "./types";

const LIST_SELECT = `
  slug, title, excerpt, cover_image_path, published_at, reading_minutes,
  category:categories!articles_category_id_fkey(name, slug),
  article_tags(tags(slug))
`;

function firstOrNull<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

type ListRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_path: string | null;
  published_at: string | null;
  reading_minutes: number;
  category: ArticleCategoryRef | ArticleCategoryRef[] | null;
  article_tags?: { tags: { slug: string } | { slug: string }[] | null }[] | null;
};

function toListItem(row: ListRow): ArticleListItem {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: resolveImageUrl(row.cover_image_path, "article-images"),
    category: firstOrNull(row.category),
    publishedAt: row.published_at,
    readingMinutes: row.reading_minutes,
  };
}

function rowTagSlugs(row: ListRow): string[] {
  return (row.article_tags ?? [])
    .map((r) => firstOrNull(r.tags))
    .filter((t): t is { slug: string } => t !== null)
    .map((t) => t.slug);
}

export type ArticlesFilter = {
  category?: string;
  tag?: string;
  q?: string;
};

export async function getPublishedArticles(filter: ArticlesFilter = {}): Promise<ArticleListItem[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("articles")
    .select(LIST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (filter.q) {
    query = query.or(`title.ilike.%${filter.q}%,excerpt.ilike.%${filter.q}%,body_markdown.ilike.%${filter.q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`articles取得失敗: ${error.message}`);

  let rows = (data ?? []) as ListRow[];
  if (filter.category) {
    rows = rows.filter((r) => firstOrNull(r.category)?.slug === filter.category);
  }
  if (filter.tag) {
    rows = rows.filter((r) => rowTagSlugs(r).includes(filter.tag!));
  }
  return rows.map(toListItem);
}

async function getRelatedArticles(currentSlug: string, relatedIds: string[], categorySlug?: string) {
  const supabase = createPublicClient();

  if (relatedIds.length > 0) {
    const { data, error } = await supabase
      .from("articles")
      .select(LIST_SELECT)
      .in("id", relatedIds)
      .eq("status", "published");
    if (error) throw new Error(`related articles取得失敗: ${error.message}`);
    return (data ?? []).map(toListItem).filter((a) => a.slug !== currentSlug);
  }

  if (!categorySlug) return [];
  const all = await getPublishedArticles({ category: categorySlug });
  return all.filter((a) => a.slug !== currentSlug).slice(0, 3);
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("articles")
    .select(`
      id, slug, title, excerpt, body_markdown, cover_image_path,
      faq, related_article_ids, source_link,
      seo_title, seo_description, og_image_path, published_at, updated_at, reading_minutes,
      category:categories!articles_category_id_fkey(name, slug),
      article_tags(tags(name, slug))
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(`article取得失敗 (${slug}): ${error.message}`);
  if (!data) return null;

  const { html, headings } = renderArticleBody(data.body_markdown ?? "");
  const category = firstOrNull(data.category);
  const tags: ArticleTagRef[] = (data.article_tags ?? [])
    .map((row) => firstOrNull(row.tags))
    .filter((t): t is ArticleTagRef => t !== null);

  const relatedArticles = await getRelatedArticles(slug, data.related_article_ids ?? [], category?.slug);

  return {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    coverImageUrl: resolveImageUrl(data.cover_image_path, "article-images"),
    category,
    publishedAt: data.published_at,
    readingMinutes: data.reading_minutes,
    bodyHtml: html,
    headings,
    tags,
    faq: Array.isArray(data.faq) ? (data.faq as { question: string; answer: string }[]) : [],
    sourceLink: data.source_link,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    ogImageUrl: resolveImageUrl(data.og_image_path, "article-images") ?? resolveImageUrl(data.cover_image_path, "article-images"),
    updatedAt: data.updated_at,
    relatedArticles,
  };
}

export async function getArticleCategories(): Promise<ArticleCategoryRef[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("kind", "article_category")
    .order("sort_order");
  if (error) throw new Error(`article_category取得失敗: ${error.message}`);
  return data ?? [];
}

export async function getArticleTags(): Promise<ArticleTagRef[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("tags").select("name, slug").order("name");
  if (error) throw new Error(`tags取得失敗: ${error.message}`);
  return data ?? [];
}
