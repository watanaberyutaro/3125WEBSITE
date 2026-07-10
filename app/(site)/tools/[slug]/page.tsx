import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolForm } from "@/components/tools/ToolForm";
import { buildMetadata } from "@/lib/seo/metadata";
import { toolJsonLd } from "@/lib/seo/jsonld";
import { TOOLS, getToolBySlug } from "@/lib/tools/registry";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return buildMetadata({ title: tool.name, description: tool.description, path: `/tools/${tool.slug}` });
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
          { name: tool.name, path: `/tools/${tool.slug}` },
        ]}
      />
      <JsonLd data={toolJsonLd({ name: tool.name, description: tool.description, slug: tool.slug })} />

      <PageHero eyebrowNum={tool.eyebrowNum} label="Free AI Tool" title={tool.name} description={tool.description} />

      <section className="section section--dark" aria-labelledby="tool-heading">
        <Reveal as="div" className="tool-layout">
          <ToolForm slug={tool.slug} fields={tool.fields} />
        </Reveal>
      </section>
    </>
  );
}
