import type { Json } from "@/lib/supabase/types";

type ReviewCommentForGenerate = {
  comment_type: string;
  body: string;
};

type SourceVersion = {
  title: string;
  body_markdown: string;
  seo_title: string | null;
  seo_description: string | null;
  faq: Json;
  cta_label: string | null;
  cta_href: string | null;
};

type GeneratedVersion = {
  title: string;
  body_markdown: string;
  seo_title: string | null;
  seo_description: string | null;
  faq: Json;
  cta_label: string | null;
  cta_href: string | null;
};

const COMMENT_TYPE_LABEL: Record<string, string> = {
  rejection: "却下",
  revision: "修正依頼",
};

/**
 * LLMを使わないルールベース生成。過去の却下・修正依頼コメントを
 * 「対応チェックリスト」として本文冒頭に機械的に追記するだけで、
 * 新しい文章を書くわけではない（誠実さを優先し、LLMなしで文章生成を
 * 偽装しない）。seo_title等はそのまま引き継ぐ。
 */
export function buildRevisedContent(source: SourceVersion, comments: ReviewCommentForGenerate[]): GeneratedVersion {
  const checklist = comments
    .map((c) => `- [ ] （${COMMENT_TYPE_LABEL[c.comment_type] ?? c.comment_type}）${c.body}`)
    .join("\n");

  const body_markdown = checklist ? `${checklist}\n\n${source.body_markdown}` : source.body_markdown;

  return {
    title: source.title,
    body_markdown,
    seo_title: source.seo_title,
    seo_description: source.seo_description,
    faq: source.faq,
    cta_label: source.cta_label,
    cta_href: source.cta_href,
  };
}
