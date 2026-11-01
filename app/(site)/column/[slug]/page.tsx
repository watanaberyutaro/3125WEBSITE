import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { TableOfContents } from "@/components/column/TableOfContents";
import { ArticleTags } from "@/components/column/ArticleTags";
import { RelatedArticles } from "@/components/column/RelatedArticles";
import { FaqSection } from "@/components/column/FaqSection";
import { getArticleBySlug, getPublishedArticles } from "@/lib/column/queries";
import { articleJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const title = article.seoTitle ?? article.title;
  const description = article.seoDescription ?? article.excerpt ?? article.title;

  return buildMetadata({
    title,
    description,
    path: `/column/${slug}`,
    images: article.ogImageUrl ? [article.ogImageUrl] : undefined,
    type: "article",
    publishedTime: article.publishedAt ?? undefined,
    modifiedTime: article.updatedAt,
  });
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const categorySlug = article.category?.slug ?? "news";

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Home", path: "/" },
          { name: "News", path: "/column" },
          { name: article.title, path: `/column/${slug}` },
        ]}
      />
      <JsonLd
        data={articleJsonLd({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          coverImageUrl: article.coverImageUrl,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt,
        })}
      />

      <div className="article-hero">
        <Link href="/column" className="article-hero__back">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          News 一覧へ
        </Link>

        <div className="article-hero__meta">
          <span className={`article-hero__badge article-hero__badge--${categorySlug}`}>
            {article.category?.name ?? "News"}
          </span>
          <time className="article-hero__date" dateTime={article.publishedAt ?? undefined}>
            {formatDate(article.publishedAt)}
          </time>
        </div>

        <h1 className="article-hero__title">{article.title}</h1>
      </div>

      <div className="article-body">
        {article.coverImageUrl && (
          <div className="article-body__image">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              sizes="800px"
              priority
              style={{ objectFit: "cover" }}
            />
          </div>
        )}

        <TableOfContents headings={article.headings} />

        {article.bodyHtml && (
          <>
            <div className="article-body__rule" aria-hidden="true" />
            <div className="article-body__text" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
          </>
        )}

        <ArticleTags tags={article.tags} />

        {article.sourceLink && (
          <a href={article.sourceLink} className="article-body__link" target="_blank" rel="noopener noreferrer">
            元記事を読む
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>

      <FaqSection faq={article.faq} />
      <RelatedArticles articles={article.relatedArticles} />
    </>
  );
}
