"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { slugify } from "./slug";

const WorkSchema = z.object({
  slug: z.string().trim().optional().default(""),
  client_name: z.string().trim().min(1, "クライアント名は必須です"),
  project_name: z.string().trim().min(1, "案件名は必須です"),
  category_id: z.string().trim().min(1, "カテゴリを選択してください"),
  industry_id: z.string().trim().optional().default(""),
  year: z.string().trim().optional().default(""),
  excerpt: z.string().trim().optional().default(""),
  description: z.string().trim().optional().default(""),
  external_link: z.string().trim().optional().default(""),
  cover_image_path: z.string().trim().optional().default(""),
  tags: z.string().trim().optional().default(""),
  scope: z.string().trim().optional().default(""),
  category_label: z.string().trim().optional().default(""),
  status: z.enum(["draft", "published"]),
  seo_title: z.string().trim().optional().default(""),
  seo_description: z.string().trim().optional().default(""),
  og_image_path: z.string().trim().optional().default(""),
  sort_order: z.coerce.number().int().min(0).default(0),
});

function parseTags(raw: string): string[] {
  return raw
    .split(/[,、]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export type WorkActionState = { error?: string } | undefined;

export async function createWork(_prev: WorkActionState, formData: FormData): Promise<WorkActionState> {
  await requireStaff();

  const parsed = WorkSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" / ") };
  }
  const data = parsed.data;
  const slug = data.slug ? slugify(data.slug) : slugify(`${data.client_name}-${data.project_name}`);

  const supabase = await createClient();
  const { error } = await supabase.from("works").insert({
    slug,
    client_name: data.client_name,
    project_name: data.project_name,
    category_id: data.category_id,
    industry_id: data.industry_id || null,
    year: data.year || null,
    excerpt: data.excerpt || null,
    description: data.description || null,
    external_link: data.external_link || null,
    cover_image_path: data.cover_image_path || null,
    tags: parseTags(data.tags),
    scope: data.scope || null,
    category_label: data.category_label || null,
    status: data.status,
    seo_title: data.seo_title || null,
    seo_description: data.seo_description || null,
    og_image_path: data.og_image_path || null,
    sort_order: data.sort_order,
    published_at: data.status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    return { error: `保存に失敗しました: ${error.message}` };
  }

  revalidatePath("/admin/works");
  revalidatePath("/works");
  redirect("/admin/works?saved=1");
}

export async function updateWork(_prev: WorkActionState, formData: FormData): Promise<WorkActionState> {
  await requireStaff();

  const id = String(formData.get("id") ?? "");
  const parsed = WorkSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" / ") };
  }
  const data = parsed.data;
  const supabase = await createClient();

  const { data: existing } = await supabase.from("works").select("slug, published_at, status").eq("id", id).single();
  const slug = data.slug
    ? slugify(data.slug)
    : existing?.slug
      ? slugify(existing.slug)
      : slugify(`${data.client_name}-${data.project_name}`);
  const publishedAt =
    data.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : existing?.published_at;

  const { error } = await supabase
    .from("works")
    .update({
      slug,
      client_name: data.client_name,
      project_name: data.project_name,
      category_id: data.category_id,
      industry_id: data.industry_id || null,
      year: data.year || null,
      excerpt: data.excerpt || null,
      description: data.description || null,
      external_link: data.external_link || null,
      cover_image_path: data.cover_image_path || null,
      tags: parseTags(data.tags),
      scope: data.scope || null,
      category_label: data.category_label || null,
      status: data.status,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      og_image_path: data.og_image_path || null,
      sort_order: data.sort_order,
      published_at: publishedAt,
    })
    .eq("id", id);

  if (error) {
    return { error: `更新に失敗しました: ${error.message}` };
  }

  revalidatePath("/admin/works");
  revalidatePath("/works");
  revalidatePath(`/works/${slug}`);
  redirect("/admin/works?saved=1");
}

export async function deleteWork(id: string): Promise<void> {
  await requireStaff();
  const supabase = await createClient();
  const { data: work } = await supabase.from("works").select("slug").eq("id", id).single();
  const { error } = await supabase.from("works").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/works");
  revalidatePath("/works");
  if (work?.slug) revalidatePath(`/works/${work.slug}`);
}
