/**
 * DBに保存された画像パスを実際に表示可能なURLへ解決する。
 * - "/assets/images/..." … 旧サイトから引き継いだ静的アセット(public/配下、URL不変)
 * - "http(s)://..."       … 既にフルURL(Supabase Storageの公開URL等)
 * - それ以外               … Supabase Storageのオブジェクトキーとみなし、指定バケットの公開URLを組み立てる
 */
export function resolveImageUrl(
  path: string | null | undefined,
  bucket: "works-images" | "article-images" | "og-images" = "works-images",
): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
