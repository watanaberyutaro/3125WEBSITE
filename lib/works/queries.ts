import { createPublicClient } from "@/lib/supabase/public";
import { resolveImageUrl } from "@/lib/media";
import type { WorkCategoryRef, WorkDetail, WorkListItem } from "./types";

const LIST_SELECT = `
  slug, client_name, project_name, year, sort_order, cover_image_path,
  category:categories!works_category_id_fkey(name, slug),
  industry:categories!works_industry_id_fkey(name, slug)
`;

const DETAIL_SELECT = `
  slug, client_name, project_name, year, sort_order, cover_image_path,
  description, excerpt, tags, scope, category_label, external_link,
  seo_title, seo_description, og_image_path, published_at, updated_at,
  category:categories!works_category_id_fkey(name, slug),
  industry:categories!works_industry_id_fkey(name, slug)
`;

// SupabaseのJOINは配列で返るがFK 1:1関係なので実質1件。安全に単一オブジェクトへ正規化する。
function firstOrNull<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toListItem(row: {
  slug: string;
  client_name: string;
  project_name: string;
  year: string | null;
  sort_order: number;
  cover_image_path: string | null;
  category: WorkCategoryRef | WorkCategoryRef[] | null;
  industry: WorkCategoryRef | WorkCategoryRef[] | null;
}): WorkListItem {
  return {
    slug: row.slug,
    clientName: row.client_name,
    projectName: row.project_name,
    year: row.year,
    sortOrder: row.sort_order,
    coverImageUrl: resolveImageUrl(row.cover_image_path),
    category: firstOrNull(row.category),
    industry: firstOrNull(row.industry),
  };
}

export type WorksFilter = {
  category?: string;
  industry?: string;
  q?: string;
};

export async function getPublishedWorks(filter: WorksFilter = {}): Promise<WorkListItem[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("works")
    .select(LIST_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (filter.q) {
    query = query.or(
      `client_name.ilike.%${filter.q}%,project_name.ilike.%${filter.q}%,description.ilike.%${filter.q}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(`works取得失敗: ${error.message}`);

  let items = (data ?? []).map(toListItem);

  // category/industryはFK経由の埋め込みリソースのためクエリレベルのフィルタが
  // 信頼できず、取得後にアプリ側でフィルタする（件数が小さいため実用上問題ない）。
  if (filter.category) {
    items = items.filter((w) => w.category?.slug === filter.category);
  }
  if (filter.industry) {
    items = items.filter((w) => w.industry?.slug === filter.industry);
  }

  return items;
}

export async function getWorkBySlug(slug: string): Promise<WorkDetail | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("works")
    .select(DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(`work取得失敗 (${slug}): ${error.message}`);
  if (!data) return null;

  return {
    ...toListItem(data),
    description: data.description,
    excerpt: data.excerpt,
    tags: data.tags ?? [],
    scope: data.scope,
    categoryLabel: data.category_label,
    externalLink: data.external_link,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    ogImageUrl: resolveImageUrl(data.og_image_path) ?? resolveImageUrl(data.cover_image_path),
    publishedAt: data.published_at,
    updatedAt: data.updated_at,
  };
}

export async function getWorkCategories(): Promise<WorkCategoryRef[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("kind", "work_category")
    .order("sort_order");
  if (error) throw new Error(`work_category取得失敗: ${error.message}`);
  return data ?? [];
}

export async function getWorkIndustries(): Promise<WorkCategoryRef[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("kind", "work_industry")
    .order("sort_order");
  if (error) throw new Error(`work_industry取得失敗: ${error.message}`);
  return data ?? [];
}
