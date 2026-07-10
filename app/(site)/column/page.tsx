import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ColumnFilter } from "@/components/column/ColumnFilter";
import { ArticleList } from "@/components/column/ArticleList";
import { SearchForm } from "@/components/ui/SearchForm";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { getArticleCategories, getPublishedArticles } from "@/lib/column/queries";
import { buildMetadata } from "@/lib/seo/metadata";

const TITLE = "News / Blog";
const DESCRIPTION = "3125株式会社のお知らせ・ブログ。AI活用・映像・Web制作に関する最新情報をお届けします。";

export const metadata: Metadata = {
  ...buildMetadata({ title: TITLE, description: DESCRIPTION, path: "/column" }),
  alternates: {
    canonical: "/column",
    types: { "application/rss+xml": "/column/rss.xml" },
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
      <Breadcrumb items={[{ name: "Home", path: "/" }, { name: "News", path: "/column" }]} />
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
