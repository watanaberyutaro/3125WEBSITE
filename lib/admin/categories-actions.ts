"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { slugify } from "./slug";

const CategoryKind = z.enum(["work_category", "work_industry", "article_category"]);

export type CategoryActionState = { error?: string } | undefined;

export async function createCategory(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireStaff();

  const kind = CategoryKind.safeParse(formData.get("kind"));
  const name = String(formData.get("name") ?? "").trim();
  if (!kind.success || !name) {
    return { error: "カテゴリ種別と名前は必須です。" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    kind: kind.data,
    name,
    slug: slugify(name),
    sort_order: 999,
  });

  if (error) {
    return { error: `追加に失敗しました: ${error.message}` };
  }

  revalidatePath("/admin/categories");
  return undefined;
}

export async function deleteCategory(id: string): Promise<void> {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
}
