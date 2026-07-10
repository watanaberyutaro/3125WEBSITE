import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { WorksGrid } from "@/components/works/WorksGrid";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { getPublishedWorks, getWorkIndustries } from "@/lib/works/queries";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

export async function generateStaticParams() {
  const industries = await getWorkIndustries();
  return industries.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string }>;
}): Promise<Metadata> {
  const { industry } = await params;
  const industries = await getWorkIndustries();
  const current = industries.find((i) => i.slug === industry);
  if (!current) return {};

  const title = `${current.name}業界の制作実績`;
  const description = `3125株式会社が手がけた${current.name}業界の制作実績一覧。`;

  return {
    title,
    description,
    alternates: { canonical: `/works/industry/${industry}` },
    openGraph: { title: `${title} | ${siteConfig.name}`, description, url: `/works/industry/${industry}` },
  };
}

export default async function WorksIndustryPage({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const { industry } = await params;
  const industries = await getWorkIndustries();
  const current = industries.find((i) => i.slug === industry);
  if (!current) notFound();

  const works = await getPublishedWorks({ industry });

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Home", path: "/" },
          { name: "Works", path: "/works" },
          { name: current.name, path: `/works/industry/${industry}` },
        ]}
      />
      <PageHero
        eyebrowNum="Works"
        label="Selected Works"
        title={`${current.name}の実績。`}
        description="映像制作・Webサイト制作・写真撮影——クライアントの想いを形にした、私たちの仕事の記録です。"
      />
      <section className="section section--dark" aria-label={`${current.name}業界の制作実績一覧`}>
        <WorksGrid works={works} />
      </section>
    </>
  );
}
