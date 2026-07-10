import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * service role keyを使うサーバー専用クライアント。RLSを完全にバイパスする。
 * Route Handler（/api/contact, /api/tools/[slug] 等）でのみ使用し、
 * Client Component / ブラウザに絶対に渡さないこと。
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
