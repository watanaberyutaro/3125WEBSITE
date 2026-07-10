/**
 * プレースホルダー型定義。
 * Phase 2でSupabaseにスキーマ適用後、以下のコマンドで実体を生成し置き換える:
 *
 *   npm run db:types
 *   (= supabase gen types typescript --project-id <PROJECT_ID> > lib/supabase/types.ts)
 */
export type Database = Record<string, never>;
