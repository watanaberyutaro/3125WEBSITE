import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/layout/PageHero";
import { FaqSection } from "@/components/column/FaqSection";
import { CtaButton } from "@/components/ui/CtaButton";
import { getServiceBySlug, listServiceSlugs } from "@/lib/content/service-pages";
import { serviceJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};

  return buildMetadata({
    title: service.seoTitle ?? service.title,
    description: service.seoDescription ?? service.title,
    path: `/services/${slug}`,
    type: "article",
    modifiedTime: service.updatedAt ?? undefined,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.title, path: `/services/${slug}` },
        ]}
      />
      <JsonLd
        data={serviceJsonLd({
          title: service.title,
          slug: service.slug,
          description: service.seoDescription,
          updatedAt: service.updatedAt,
        })}
      />

      <PageHero
        eyebrowNum="Srv"
        label="Services"
        title={service.title}
        description={service.seoDescription ?? service.title}
      />

      <div className="article-body">
        {service.bodyHtml && (
          <div className="article-body__text" dangerouslySetInnerHTML={{ __html: service.bodyHtml }} />
        )}

        {service.ctaLabel && service.ctaHref && (
          <div className="mt-8">
            <CtaButton href={service.ctaHref} variant="gold">
              {service.ctaLabel}
            </CtaButton>
          </div>
        )}
      </div>

      <FaqSection faq={service.faq} />
    </>
  );
}
