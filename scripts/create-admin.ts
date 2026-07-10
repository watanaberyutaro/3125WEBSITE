/**
 * Supabase Authに管理者ユーザーを作成し、profilesへrole='admin'の行を追加する。
 * 一度きりのセットアップ用スクリプト。
 *
 * 実行: npx tsx --env-file=.env.local scripts/create-admin.ts <email> <password>
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const [, , email, password] = process.argv;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("環境変数が未設定です（.env.local）。");
  process.exit(1);
}
if (!email || !password) {
  console.error("使い方: npx tsx --env-file=.env.local scripts/create-admin.ts <email> <password>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const already = existing.users.find((u) => u.email === email);

  let userId: string;
  if (already) {
    userId = already.id;
    console.log(`既存ユーザーを使用: ${email} (${userId})`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`ユーザー作成完了: ${email} (${userId})`);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, role: "admin", display_name: "管理者" }, { onConflict: "id" });
  if (profileError) throw profileError;

  console.log("profiles.role=admin を設定しました。");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
