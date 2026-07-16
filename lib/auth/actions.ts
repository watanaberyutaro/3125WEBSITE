"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string } | undefined;

/**
 * next.startsWith("/admin")だけでは不十分（実際に存在しないパスも通ってしまう）。
 * 例えば /admin/index.php のような旧PHPサイト・bot探索由来の存在しないURLが
 * next に紛れ込むと、ログイン自体は成功するのに直後の遷移先がNext.jsのどの
 * ルートにも一致せずVercelの拡張子ベースの保護に阻まれ403になる、という
 * 分かりにくい失敗を踏んだ（実際に発生を確認済み）。実在する管理画面ルートの
 * 形（英数字・ハイフン・アンダースコア・スラッシュのみ、拡張子や記号を含まない）
 * のみを許可することで、ドット付きの怪しいパスを弾く。
 */
function sanitizeNextPath(next: string): string {
  return /^\/admin(\/[a-zA-Z0-9_-]+)*\/?$/.test(next) ? next : "/admin";
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = sanitizeNextPath(String(formData.get("next") ?? "/admin"));

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません。" };
  }

  redirect(next);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
