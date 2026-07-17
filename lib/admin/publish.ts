/**
 * publish_jobsが実際にpushしてよい対象を厳格に制限する。
 *
 * 設計方針: フェーズ3時点では、下書きの内容(title/body_markdown/faq/cta等)から
 * 実行可能なコード(.tsx等)を安全に自動生成する手段がない。生成AIが将来書いた
 * 内容をそのままpage.tsxとして本番mainへ直接pushすると、ビルド自体を壊すリスクが
 * あるため、pushできるのは content/ 配下のMarkdownデータファイルのみに限定する。
 * サービスページ等の実コード(.tsx)へ反映する仕組みは、このMarkdownを読み込んで
 * 描画するページ側の実装（フェーズ5のSEO受け皿拡張などで）を別途作る前提とする。
 */
const ALLOWED_PATH_PATTERN = /^content\/[a-z0-9][a-z0-9/_-]*\.md$/;

export function isPathAllowed(path: string): boolean {
  if (path.includes("..")) return false;
  return ALLOWED_PATH_PATTERN.test(path);
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
 */
export function serializeToMarkdown(version: PublishableVersion): string {
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
    "---",
  ].filter((line): line is string => line !== null);

  return `${frontmatterLines.join("\n")}\n\n${version.body_markdown}\n`;
}
