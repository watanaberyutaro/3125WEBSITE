import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StaffProfile = {
  id: string;
  role: "admin" | "editor";
  displayName: string | null;
  email: string | null;
};

/**
 * ログイン中のstaffプロフィールを取得する。未ログイン・profiles未登録なら
 * /admin/login へリダイレクトする（middleware.tsに続く多層防御の2段目）。
 */
export async function requireStaff(): Promise<StaffProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/admin/login");

  return {
    id: profile.id,
    role: profile.role as "admin" | "editor",
    displayName: profile.display_name,
    email: user.email ?? null,
  };
}

/** adminロール限定ページ用。editorがアクセスした場合はダッシュボードへ戻す。 */
export async function requireAdmin(): Promise<StaffProfile> {
  const staff = await requireStaff();
  if (staff.role !== "admin") redirect("/admin");
  return staff;
}
