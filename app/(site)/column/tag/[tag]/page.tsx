import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { ArticleList } from "@/components/column/ArticleList";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { getArticleTags, getPublishedArticles } from "@/lib/column/queries";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateStaticParams() {
  const tags = await getArticleTags();
  return tags.map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const tags = await getArticleTags();
  const current = tags.find((t) => t.slug === tag);
  if (!current) return {};

  const title = `#${current.name} の記事一覧`;
  const description = `3125株式会社の「${current.name}」タグが付いた記事一覧。`;

  return buildMetadata({ title, description, path: `/column/tag/${tag}` });
}

export default async function ColumnTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const tags = await getArticleTags();
  const current = tags.find((t) => t.slug === tag);
  if (!current) notFound();

  const articles = await getPublishedArticles({ tag });

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Home", path: "/" },
          { name: "News", path: "/column" },
          { name: `#${current.name}`, path: `/column/tag/${tag}` },
        ]}
      />
      <PageHero
        eyebrowNum="News"
        label="Tag"
        title={`#${current.name}`}
        description="このタグが付いた記事の一覧です。"
      />
      <section className="section section--dark" aria-label={`${current.name}タグの記事一覧`}>
        <ArticleList articles={articles} />
      </section>
    </>
  );
}
