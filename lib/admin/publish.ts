/**
 * publish_jobsが実際にpushしてよい対象を厳格に制限する。
 *
 * 設計方針: フェーズ3時点では、下書きの内容(title/body_markdown/faq/cta等)から
 * 実行可能なコード(.tsx等)を安全に自動生成する手段がない。生成AIが将来書いた
 * 内容をそのままpage.tsxとして本番mainへ直接pushすると、ビルド自体を壊すリスクが
 * あるため、pushできるのは content/ 配下のMarkdownデータファイルのみに限定する。
 *
 * フェーズ5でservice_pageの描画パイプライン（app/(site)/services/[slug]/page.tsx）
 * を実装したため、content_typeごとにpush先を厳格化する:
 *   - service_page: content/services/*.md のみ（generateStaticParamsが
 *     このディレクトリを安全に列挙できるようにするため）
 *   - それ以外(cta_copy/faq/landing_page/other): まだ描画面が存在しないため
 *     常にfalse（"誰も読まないファイルへのコミット"を防ぐ。描画面ができた
 *     フェーズで個別に解禁する）
 *   - article: そもそもこの関数を経由しない（articlesテーブルへ同期publishする
 *     ため。reviewDraft参照）
 */
const SERVICE_PAGE_PATH_PATTERN = /^content\/services\/[a-z0-9][a-z0-9-]*\.md$/;

export function isPathAllowed(path: string, contentType: string): boolean {
  if (path.includes("..")) return false;
  if (contentType === "service_page") return SERVICE_PAGE_PATH_PATTERN.test(path);
  return false;
}

type PublishableVersion = {
  title: string;
  body_markdown: string;
  seo_title: string | null;
  seo_description: string | null;
  faq: unknown;
  cta_label: string | null;
  cta_href: string | null;
};

function yamlEscape(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * draft_versionの内容をYAMLフロントマター付きMarkdownへシリアライズする。
 * 実行可能コードを一切含まないプレーンテキストのため、内容が壊れていても
 * Next.jsのビルド自体が失敗することはない（表示側の実装が別途必要になるだけ）。
 *
 * updatedAtはフェーズ5で追加。ファイルのgit checkout時mtimeはVercelビルド時に
 * リセットされ当てにならないため、sitemapのlastModified用にフロントマター側へ
 * 明示的に日時を持たせる（呼び出し元がprocessed_atと同じタイムスタンプを渡す）。
 * lib/content/frontmatter.tsのparseFrontmatter()がこの形式を読み取る。
 */
export function serializeToMarkdown(version: PublishableVersion, updatedAt: string): string {
  const faq = Array.isArray(version.faq) ? (version.faq as { question: string; answer: string }[]) : [];

  const frontmatterLines = [
    "---",
    `title: ${yamlEscape(version.title)}`,
    version.seo_title ? `seo_title: ${yamlEscape(version.seo_title)}` : null,
    version.seo_description ? `seo_description: ${yamlEscape(version.seo_description)}` : null,
    version.cta_label ? `cta_label: ${yamlEscape(version.cta_label)}` : null,
    version.cta_href ? `cta_href: ${yamlEscape(version.cta_href)}` : null,
    faq.length > 0 ? "faq:" : null,
    ...faq.flatMap((f) => [`  - question: ${yamlEscape(f.question)}`, `    answer: ${yamlEscape(f.answer)}`]),
    `updated_at: ${yamlEscape(updatedAt)}`,
    "---",
  ].filter((line): line is string => line !== null);

  return `${frontmatterLines.join("\n")}\n\n${version.body_markdown}\n`;
}
