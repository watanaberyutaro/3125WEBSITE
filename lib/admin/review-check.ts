type CheckableVersion = {
  body_markdown: string;
  seo_title: string | null;
  seo_description: string | null;
  faq: unknown;
  cta_label: string | null;
  cta_href: string | null;
};

export type ReviewCheckResult = {
  passed: boolean;
  issues: string[];
};

const MIN_BODY_LENGTH = 100;
const SEO_TITLE_MAX = 60;
const SEO_DESCRIPTION_MAX = 160;

/**
 * 人間のreviewDraft承認フローを置き換えない、承認前の機械的な事前チェック。
 * LLMを使わないため「良い文章か」は判定できず、抜け漏れの機械的検出に限定する。
 */
export function runAutomatedChecks(content_type: string, version: CheckableVersion): ReviewCheckResult {
  const issues: string[] = [];

  if (version.body_markdown.trim().length < MIN_BODY_LENGTH) {
    issues.push(`本文が短すぎます（${version.body_markdown.trim().length}文字、最低${MIN_BODY_LENGTH}文字推奨）`);
  }

  if (version.seo_title && version.seo_title.length > SEO_TITLE_MAX) {
    issues.push(`SEOタイトルが長すぎます（${version.seo_title.length}文字、${SEO_TITLE_MAX}文字以内推奨）`);
  }

  if (version.seo_description && version.seo_description.length > SEO_DESCRIPTION_MAX) {
    issues.push(`SEO descriptionが長すぎます（${version.seo_description.length}文字、${SEO_DESCRIPTION_MAX}文字以内推奨）`);
  }

  if (content_type === "landing_page" && (!version.cta_label || !version.cta_href)) {
    issues.push("ランディングページにはCTA文言・CTA遷移先の両方が必要です");
  }

  if (content_type === "faq" && (!Array.isArray(version.faq) || version.faq.length === 0)) {
    issues.push("FAQ種別にはFAQ項目が最低1件必要です");
  }

  if (/- \[ \]/.test(version.body_markdown)) {
    issues.push("本文に未対応のチェックリスト項目（- [ ]）が残っています");
  }

  if (/TODO/.test(version.body_markdown)) {
    issues.push("本文にTODOの記載が残っています");
  }

  return { passed: issues.length === 0, issues };
}
