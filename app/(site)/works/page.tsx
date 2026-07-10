import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { WorksFilter } from "@/components/works/WorksFilter";
import { SearchForm } from "@/components/ui/SearchForm";
import { WorksGrid } from "@/components/works/WorksGrid";
import { getPublishedWorks, getWorkCategories } from "@/lib/works/queries";
import { siteConfig } from "@/lib/site-config";

const TITLE = "制作実績（映像・Web・写真）";
const DESCRIPTION =
  "3125株式会社の制作実績 — 映像制作・Webサイト制作・写真撮影の実績をご覧ください。AI活用支援から映像・Webまで、クライアントの想いを形にした仕事の記録。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/works" },
  openGraph: {
    title: `${TITLE} | ${siteConfig.name}`,
    description: DESCRIPTION,
    url: "/works",
    images: ["/assets/images/ogp.jpg"],
  },
};

// Supabaseの最新データを都度反映するため動的レンダリング。
// (カテゴリ/検索クエリの組み合わせが無限にあるためSSGではなくSSR)
export const revalidate = 0;

export default async function WorksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const [works, categories] = await Promise.all([
    getPublishedWorks({ category, q }),
    getWorkCategories(),
  ]);

  return (
    <>
      <PageHero
        eyebrowNum="Works"
        label="Selected Works"
        title="制作実績。"
        description="映像制作・Webサイト制作・写真撮影——クライアントの想いを形にした、私たちの仕事の記録です。"
      />

      <section className="section section--dark" aria-label="制作実績一覧">
        <SearchForm basePath="/works" defaultValue={q ?? ""} placeholder="クライアント名・案件名で検索" label="実績を検索" />
        <WorksFilter categories={categories} activeCategory={category} currentQuery={q} />
        <WorksGrid works={works} />
      </section>
    </>
  );
}
