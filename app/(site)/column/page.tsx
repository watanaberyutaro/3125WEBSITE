import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ColumnFilter } from "@/components/column/ColumnFilter";
import { ArticleList } from "@/components/column/ArticleList";
import { SearchForm } from "@/components/ui/SearchForm";
import { getArticleCategories, getPublishedArticles } from "@/lib/column/queries";
import { siteConfig } from "@/lib/site-config";

const TITLE = "News / Blog";
const DESCRIPTION = "3125株式会社のお知らせ・ブログ。AI活用・映像・Web制作に関する最新情報をお届けします。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/column",
    types: { "application/rss+xml": "/column/rss.xml" },
  },
  openGraph: {
    title: `${TITLE} | ${siteConfig.name}`,
    description: DESCRIPTION,
    url: "/column",
    images: ["/assets/images/ogp.jpg"],
  },
};

export const revalidate = 0;

export default async function ColumnPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const [articles, categories] = await Promise.all([
    getPublishedArticles({ category, q }),
    getArticleCategories(),
  ]);

  return (
    <>
      <PageHero
        eyebrowNum="News"
        label="Latest Updates"
        title="お知らせ。"
        description="3125株式会社からの最新情報・ニュース・ブログをお届けします。"
      />

      <section className="section section--dark" aria-label="お知らせ一覧">
        <SearchForm basePath="/column" defaultValue={q ?? ""} placeholder="キーワードで検索" label="記事を検索" />
        <ColumnFilter categories={categories} activeCategory={category} currentQuery={q} />
        <ArticleList articles={articles} />
      </section>
    </>
  );
}
