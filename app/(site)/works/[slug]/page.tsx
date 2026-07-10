import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { HomeCta } from "@/components/layout/HomeCta";
import { Reveal } from "@/components/motion/Reveal";
import { getPublishedWorks, getWorkBySlug } from "@/lib/works/queries";
import { creativeWorkJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateStaticParams() {
  const works = await getPublishedWorks();
  return works.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) return {};

  const title = `${work.seoTitle ?? `${work.clientName} ${work.projectName}`} | 制作実績`;
  const description =
    work.seoDescription ??
    work.excerpt ??
    work.description?.slice(0, 120) ??
    `${work.clientName}の制作実績。`;

  return buildMetadata({
    title,
    description,
    path: `/works/${slug}`,
    images: work.ogImageUrl ? [work.ogImageUrl] : undefined,
    type: "article",
    publishedTime: work.publishedAt ?? undefined,
    modifiedTime: work.updatedAt,
  });
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) notFound();

  const num = String(work.sortOrder).padStart(2, "0");
  const categoryLabel = work.categoryLabel ?? work.category?.name ?? "Web";

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Home", path: "/" },
          { name: "Works", path: "/works" },
          { name: `${work.clientName} ${work.projectName}`, path: `/works/${slug}` },
        ]}
      />
      <JsonLd
        data={creativeWorkJsonLd({
          clientName: work.clientName,
          projectName: work.projectName,
          slug: work.slug,
          description: work.description,
          coverImageUrl: work.coverImageUrl,
          publishedAt: work.publishedAt,
        })}
      />

      <div className="work-detail-hero" aria-label="プロジェクトビジュアル">
        {work.coverImageUrl && (
          <Image
            className="work-detail-hero__img"
            src={work.coverImageUrl}
            alt={`${work.clientName} ${work.projectName}`}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        )}
        <div className="work-detail-hero__overlay" aria-hidden="true" />
        <div className="work-detail-hero__meta">
          <p className="work-detail-hero__cat">
            {work.category?.name ?? "Web"} — {num}
          </p>
          <h1 className="work-detail-hero__title">
            {work.clientName}
            <br />
            {work.projectName}
          </h1>
        </div>
      </div>

      <div className="work-detail-body">
        <Reveal as="aside" className="work-detail-meta">
          <div className="work-detail-meta__item">
            <p className="work-detail-meta__label">Client</p>
            <p className="work-detail-meta__value">{work.clientName}</p>
          </div>
          <div className="work-detail-meta__item">
            <p className="work-detail-meta__label">Category</p>
            <p className="work-detail-meta__value">{categoryLabel}</p>
          </div>
          {work.industry && (
            <div className="work-detail-meta__item">
              <p className="work-detail-meta__label">Industry</p>
              <p className="work-detail-meta__value">{work.industry.name}</p>
            </div>
          )}
          {work.year && (
            <div className="work-detail-meta__item">
              <p className="work-detail-meta__label">Year</p>
              <p className="work-detail-meta__value">{work.year}</p>
            </div>
          )}
          {work.scope && (
            <div className="work-detail-meta__item">
              <p className="work-detail-meta__label">Scope</p>
              <p className="work-detail-meta__value">{work.scope}</p>
            </div>
          )}
          {work.externalLink && (
            <div className="work-detail-meta__item">
              <p className="work-detail-meta__label">URL</p>
              <p className="work-detail-meta__value">
                <a
                  href={work.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}
                >
                  {work.externalLink.replace(/^https?:\/\//, "")}
                </a>
              </p>
            </div>
          )}
        </Reveal>

        <Reveal as="div" delay={1} className="work-detail-content">
          <Link className="work-detail-back" href="/works">
            ← Works 一覧へ戻る
          </Link>

          {work.description && (
            <>
              <p className="work-detail-section-label">Overview</p>
              <p className="work-detail-overview">
                {work.description.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </>
          )}

          {work.tags.length > 0 && (
            <>
              <p className="work-detail-section-label">Tags</p>
              <div className="work-detail-tags">
                {work.tags.map((tag) => (
                  <span className="work-detail-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </Reveal>
      </div>

      <HomeCta
        bg="dark2"
        eyebrow="Next Project"
        title="あなたのプロジェクトを、次の作品に。"
        sub="映像・Web・AI活用まで。どんなご相談もお気軽にどうぞ。"
        primary={{ href: "/contact", label: "プロジェクトを相談する" }}
        secondary={{ href: "/works", label: "Works 一覧を見る" }}
      />
    </>
  );
}
