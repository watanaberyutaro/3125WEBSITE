import { createClient } from "@/lib/supabase/server";

export async function getAdminWorks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .select("id, slug, client_name, project_name, status, sort_order, year, updated_at")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminWorkById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("works").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminArticles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, status, published_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminArticleById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*, article_tags(tag_id, tags(name))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getAllCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("kind").order("sort_order");
  if (error) throw new Error(error.message);
  return data;
}

export async function getAllTags() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminInquiries() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminToolLeads() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tool_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data;
}

export type DraftStatus = "draft" | "needs_revision" | "rejected" | "approved" | "published";

export async function getAdminDrafts(status?: DraftStatus) {
  const supabase = await createClient();
  let query = supabase.from("drafts").select("*").order("updated_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

/** 下書き詳細 + 全バージョン(新しい順) + 全コメント(新しい順)をまとめて取得する。 */
export async function getAdminDraftWithHistory(id: string) {
  const supabase = await createClient();

  const [{ data: draft, error: draftError }, { data: versions, error: versionsError }, { data: comments, error: commentsError }] =
    await Promise.all([
      supabase.from("drafts").select("*").eq("id", id).maybeSingle(),
      supabase.from("draft_versions").select("*").eq("draft_id", id).order("version_number", { ascending: false }),
      supabase
        .from("review_comments")
        .select("*, profiles(display_name)")
        .eq("draft_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (draftError) throw new Error(draftError.message);
  if (versionsError) throw new Error(versionsError.message);
  if (commentsError) throw new Error(commentsError.message);
  if (!draft) return null;

  return { draft, versions: versions ?? [], comments: comments ?? [] };
}
