import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Server Component / Route Handler / Server Action から使うSupabaseクライアント。
 * anon key + セッションCookieでRLSが適用される（管理画面の認証チェック等に使用）。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Componentから呼ばれた場合はCookie書き込み不可（middlewareがセッション更新を担当するため無視してよい）
          }
        },
      },
    },
  );
}
