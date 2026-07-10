import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * 公開ページ(works/column一覧・詳細など)の読み取り専用クエリ用クライアント。
 * next/headers の cookies() に依存しないため、これを使うServer Componentは
 * 静的生成・ISRの対象になれる（server.ts のcookieベースクライアントを使うと
 * 動的レンダリングに固定されてしまう）。anon key・RLS配下で動作する。
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
