import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getPublishedWorks, getWorkCategories, getWorkIndustries } from "@/lib/works/queries";
import { getArticleCategories, getArticleTags, getPublishedArticles } from "@/lib/column/queries";
import { TOOLS } from "@/lib/tools/registry";

export const revalidate = 3600;

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "monthly", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/works", changeFrequency: "weekly", priority: 0.8 },
  { path: "/column", changeFrequency: "daily", priority: 0.7 },
  { path: "/tools", changeFrequency: "monthly", priority: 0.7 },
  { path: "/company", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [works, workCategories, workIndustries, articles, articleCategories, articleTags] =
    await Promise.all([
      getPublishedWorks(),
      getWorkCategories(),
      getWorkIndustries(),
      getPublishedArticles(),
      getArticleCategories(),
      getArticleTags(),
    ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${siteConfig.url}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const workEntries: MetadataRoute.Sitemap = works.map((w) => ({
    url: `${siteConfig.url}/works/${w.slug}`,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const workCategoryEntries: MetadataRoute.Sitemap = workCategories.map((c) => ({
    url: `${siteConfig.url}/works/category/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const workIndustryEntries: MetadataRoute.Sitemap = workIndustries.map((i) => ({
    url: `${siteConfig.url}/works/industry/${i.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteConfig.url}/column/${a.slug}`,
    lastModified: a.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const articleCategoryEntries: MetadataRoute.Sitemap = articleCategories.map((c) => ({
    url: `${siteConfig.url}/column/category/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const articleTagEntries: MetadataRoute.Sitemap = articleTags.map((t) => ({
    url: `${siteConfig.url}/column/tag/${t.slug}`,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  const toolEntries: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `${siteConfig.url}/tools/${t.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...workEntries,
    ...workCategoryEntries,
    ...workIndustryEntries,
    ...articleEntries,
    ...articleCategoryEntries,
    ...articleTagEntries,
    ...toolEntries,
  ];
}
