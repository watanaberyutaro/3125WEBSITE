import { getPublishedArticles } from "@/lib/column/queries";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await getPublishedArticles();

  const items = articles
    .map((a) => {
      const url = `${siteConfig.url}/column/${a.slug}`;
      const pubDate = a.publishedAt ? new Date(a.publishedAt).toUTCString() : new Date().toUTCString();
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      ${a.excerpt ? `<description>${escapeXml(a.excerpt)}</description>` : ""}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)} News / Blog</title>
    <link>${siteConfig.url}/column</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>ja</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
