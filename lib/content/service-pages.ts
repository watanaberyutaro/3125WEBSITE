import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter";
import { renderArticleBody, type Heading } from "@/lib/column/markdown";

const SERVICES_DIR = path.join(process.cwd(), "content/services");
const SLUG_PATTERN = /^[a-z0-9-]+$/;

export type ServicePage = {
  slug: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  faq: { question: string; answer: string }[];
  updatedAt: string | null;
  bodyHtml: string;
  headings: Heading[];
};

/**
 * content/services/*.md を列挙する。ディレクトリ自体が存在しない場合
 * （1件もservice_pageが承認・pushされていない初期状態）はビルドを壊さず
 * 空配列を返す。
 */
export async function listServiceSlugs(): Promise<string[]> {
  try {
    const files = await readdir(SERVICES_DIR);
    return files.filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -".md".length));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

export async function getServiceBySlug(slug: string): Promise<ServicePage | null> {
  if (!SLUG_PATTERN.test(slug)) return null;

  let raw: string;
  try {
    raw = await readFile(path.join(SERVICES_DIR, `${slug}.md`), "utf-8");
  } catch {
    return null;
  }

  const parsed = parseFrontmatter(raw);
  if (!parsed) return null;

  const { html, headings } = renderArticleBody(parsed.body);

  return {
    slug,
    title: parsed.frontmatter.title,
    seoTitle: parsed.frontmatter.seo_title,
    seoDescription: parsed.frontmatter.seo_description,
    ctaLabel: parsed.frontmatter.cta_label,
    ctaHref: parsed.frontmatter.cta_href,
    faq: parsed.frontmatter.faq,
    updatedAt: parsed.frontmatter.updated_at,
    bodyHtml: html,
    headings,
  };
}

/** sitemap用。本文レンダリングは不要なため、フロントマターの読み取りのみ行う軽量版。 */
export async function listServicePagesForSitemap(): Promise<{ slug: string; updatedAt: string | null }[]> {
  const slugs = await listServiceSlugs();
  const pages = await Promise.all(
    slugs.map(async (slug) => {
      const raw = await readFile(path.join(SERVICES_DIR, `${slug}.md`), "utf-8").catch(() => null);
      if (!raw) return null;
      const parsed = parseFrontmatter(raw);
      if (!parsed) return null;
      return { slug, updatedAt: parsed.frontmatter.updated_at };
    })
  );
  return pages.filter((p): p is { slug: string; updatedAt: string | null } => p !== null);
}
