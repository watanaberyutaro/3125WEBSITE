import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * タイトル等からURLスラッグ候補を生成する。ASCII英数字以外は捨てる。
 * revalidatePath()等のNext.js内部処理は非ASCII文字を含むパスをHeaders相当の
 * 値として扱えずクラッシュするため、日本語のみの入力は乱数スラッグにフォールバックする。
 */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || crypto.randomUUID().slice(0, 8)
  );
}

/**
 * slugify()の結果がarticlesテーブル内で既に使われている場合、
 * "-2", "-3"...を末尾に付与して一意なslugになるまで探す。
 * タイトルの英数字部分だけが一致するケース(日本語は捨てられるため)で
 * articles_slug_key制約違反が起きていたことへの対処。
 * excludeId指定時はそのIDの行自身とは衝突とみなさない(更新時に自分のslugを維持する場合用)。
 */
export async function generateUniqueArticleSlug(
  supabase: SupabaseClient<Database>,
  baseText: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(baseText);
  let candidate = base;
  let suffix = 2;

  for (;;) {
    let query = supabase.from("articles").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix++;
  }
}
