type CheckableVersion = {
  body_markdown: string;
  seo_title: string | null;
  seo_description: string | null;
  faq: unknown;
  cta_label: string | null;
  cta_href: string | null;
};

/** articlesテーブルにはcta_label/cta_hrefカラムが存在しないため常にnullとする。 */
export function buildCheckableFromArticle(article: {
  body_markdown: string;
  seo_title: string | null;
  seo_description: string | null;
  faq: unknown;
}): CheckableVersion {
  return {
    body_markdown: article.body_markdown,
    seo_title: article.seo_title,
    seo_description: article.seo_description,
    faq: article.faq,
    cta_label: null,
    cta_href: null,
  };
}

/**
 * content/services/*.mdのフロントマター(lib/content/frontmatter.tsのparseFrontmatter()
 * が返すServiceFrontmatter、既にsnake_case)とbody(生のMarkdown、bodyHtmlではない)を
 * CheckableVersionへ正規化する。機械的チェック(文字数・チェックリスト残存等)は
 * 生Markdownに対して行う必要があるため、bodyはgetServiceBySlug()のbodyHtml
 * (レンダリング済み)ではなくparseFrontmatter()の戻り値を直接使う。
 */
export function buildCheckableFromServicePageFrontmatter(
  fm: { seo_title: string | null; seo_description: string | null; cta_label: string | null; cta_href: string | null; faq: unknown },
  body: string,
): CheckableVersion {
  return {
    body_markdown: body,
    seo_title: fm.seo_title,
    seo_description: fm.seo_description,
    faq: fm.faq,
    cta_label: fm.cta_label,
    cta_href: fm.cta_href,
  };
}

/**
 * DeepSeekへの改善提案リクエスト用システムプロンプト。rejection_rules(Phase7)の
 * ルールも同じ観点として渡し、生成AIが既に学習しているNGパターンと矛盾しない
 * 提案にする。
 */
export function buildSuggestionSystemPrompt(rules: string[]): string {
  let prompt =
    "あなたはコンテンツ品質のレビュアーです。与えられたコンテンツを読み、改善できる点を2〜4個、簡潔な箇条書きで提案してください。既に十分な品質で改善点が見当たらない場合は「特に問題は見つかりませんでした」とだけ出力してください。前置き・説明文は不要です。";
  if (rules.length > 0) {
    prompt += `\n\n以下は過去の却下・修正依頼から学んだ注意点です。この観点も踏まえて評価してください:\n${rules.map((r) => `- ${r}`).join("\n")}`;
  }
  return prompt;
}
