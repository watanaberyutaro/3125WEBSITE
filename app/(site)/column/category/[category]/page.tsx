import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { ColumnFilter } from "@/components/column/ColumnFilter";
import { ArticleList } from "@/components/column/ArticleList";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { getArticleCategories, getPublishedArticles } from "@/lib/column/queries";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getArticleCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categories = await getArticleCategories();
  const current = categories.find((c) => c.slug === category);
  if (!current) return {};

  const title = `${current.name}一覧`;
  const description = `3125株式会社の${current.name}一覧。`;

  return buildMetadata({ title, description, path: `/column/category/${category}` });
}

export default async function ColumnCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categories = await getArticleCategories();
  const current = categories.find((c) => c.slug === category);
  if (!current) notFound();

  const articles = await getPublishedArticles({ category });

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Home", path: "/" },
          { name: "News", path: "/column" },
          { name: current.name, path: `/column/category/${category}` },
        ]}
      />
      <PageHero
        eyebrowNum="News"
        label="Latest Updates"
        title={`${current.name}。`}
        description="3125株式会社からの最新情報・ニュース・ブログをお届けします。"
      />
      <section className="section section--dark" aria-label={`${current.name}一覧`}>
        <ColumnFilter categories={categories} activeCategory={category} useCleanUrls />
        <ArticleList articles={articles} />
      </section>
    </>
  );
}
