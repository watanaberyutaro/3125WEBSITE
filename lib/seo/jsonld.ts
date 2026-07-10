import { siteConfig } from "@/lib/site-config";

/** サイト全体で1回だけ出力するOrganizationスキーマ（app/layout.tsxで使用） */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/assets/images/favicon-512.png`,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      postalCode: siteConfig.address.postalCode,
      addressRegion: siteConfig.address.region,
      addressLocality: siteConfig.address.locality,
      streetAddress: siteConfig.address.streetAddress,
      addressCountry: "JP",
    },
  };
}

export type BreadcrumbItem = { name: string; path: string };

/** UI表示と同じデータソースから生成するBreadcrumbListスキーマ（表示内容との不一致を防ぐ） */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

export function articleJsonLd(article: {
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  updatedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/assets/images/favicon-512.png`,
      },
    },
    mainEntityOfPage: `${siteConfig.url}/column/${article.slug}`,
  };
}

/**
 * FAQPage構造化データ。
 * 注意: Googleは2023年よりFAQリッチリザルトの表示対象を政府・健康関連等の
 * 権威あるサイトに限定しており、一般企業サイトでは表示されない場合がある。
 * それでもJSON-LD自体は他の検索/AIエンジンのために出力する価値がある。
 * 必ずページ上に同一内容のQ&Aを可視表示すること（Googleのガイドライン要件）。
 */
export function faqJsonLd(faq: { question: string; answer: string }[]) {
  if (faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function creativeWorkJsonLd(work: {
  clientName: string;
  projectName: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${work.clientName} ${work.projectName}`,
    description: work.description ?? undefined,
    image: work.coverImageUrl ? [work.coverImageUrl] : undefined,
    datePublished: work.publishedAt ?? undefined,
    creator: { "@type": "Organization", name: siteConfig.name },
    url: `${siteConfig.url}/works/${work.slug}`,
  };
}
