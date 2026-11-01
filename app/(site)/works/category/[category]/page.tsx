import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { WorksFilter } from "@/components/works/WorksFilter";
import { WorksGrid } from "@/components/works/WorksGrid";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { getPublishedWorks, getWorkCategories } from "@/lib/works/queries";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getWorkCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categories = await getWorkCategories();
  const current = categories.find((c) => c.slug === category);
  if (!current) return {};

  const title = `${current.name}の制作実績`;
  const description = `3125株式会社が手がけた${current.name}の制作実績一覧。`;

  return buildMetadata({ title, description, path: `/works/category/${category}` });
}

export default async function WorksCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categories = await getWorkCategories();
  const current = categories.find((c) => c.slug === category);
  if (!current) notFound();

  const works = await getPublishedWorks({ category });

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Home", path: "/" },
          { name: "Works", path: "/works" },
          { name: current.name, path: `/works/category/${category}` },
        ]}
      />
      <PageHero
        eyebrowNum="Works"
        label="Selected Works"
        title={`${current.name}の実績。`}
        description="映像制作・Webサイト制作・写真撮影——クライアントの想いを形にした、私たちの仕事の記録です。"
      />
      <section className="section section--dark" aria-label={`${current.name}の制作実績一覧`}>
        <WorksFilter categories={categories} activeCategory={category} useCleanUrls />
        <WorksGrid works={works} />
      </section>
    </>
  );
}
