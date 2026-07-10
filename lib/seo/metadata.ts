import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  images?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

/**
 * OpenGraph/Twitter/canonicalを1箇所から一貫して生成する共通ヘルパー。
 * Twitterカードはog:imageと同じ画像を明示的に指定する
 * （クローラーのフォールバックに依存せず確実にカードを表示させるため）。
 */
export function buildMetadata({
  title,
  description,
  path,
  images,
  type = "website",
  publishedTime,
  modifiedTime,
}: BuildMetadataInput): Metadata {
  const ogImages = images && images.length > 0 ? images : ["/assets/images/ogp.jpg"];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title: `${title} | ${siteConfig.name}`,
      description,
      url: path,
      images: ogImages,
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: ogImages,
    },
  };
}
