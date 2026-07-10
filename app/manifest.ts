import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0F0F0D",
    theme_color: "#0F0F0D",
    lang: "ja",
    icons: [
      { src: "/assets/images/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/assets/images/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
