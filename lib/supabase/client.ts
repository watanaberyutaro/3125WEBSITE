import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/** ブラウザ（Client Component）から使うSupabaseクライアント。anon keyのみ使用。 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
