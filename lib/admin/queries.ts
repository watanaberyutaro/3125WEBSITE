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
