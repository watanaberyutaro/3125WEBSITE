import type { ToolDefinition } from "./types";
import { pricingSimulator } from "./definitions/pricing-simulator";
import { seoTitleGenerator } from "./definitions/seo-title";
import { metaDescriptionGenerator } from "./definitions/meta-description";
import { faqGenerator } from "./definitions/faq-generator";
import { ctaGenerator } from "./definitions/cta-generator";

/**
 * 全AIツールの登録台帳。新しいツールは lib/tools/definitions/ に1ファイル追加し、
 * ここに登録するだけで /tools・/tools/[slug]・/api/tools/[tool]・sitemapに自動反映される。
 * ツール数が100件規模になっても、この配列に追加するだけで済む構成。
 */
export const TOOLS: ToolDefinition<never>[] = [
  pricingSimulator,
  seoTitleGenerator,
  metaDescriptionGenerator,
  faqGenerator,
  ctaGenerator,
] as unknown as ToolDefinition<never>[];

export function getToolBySlug(slug: string): ToolDefinition<never> | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
