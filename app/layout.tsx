import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Shippori_Mincho_B1, DM_Mono, Montserrat, Alex_Brush } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";
import "@/styles/legacy-site.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const shippori = Shippori_Mincho_B1({
  variable: "--font-shippori",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  display: "swap",
});

/**
 * ブランドロゴタイプ「3125」専用の筆記体（数字のみのため和文グリフは不要）。
 * ナビ・フッター・ホームヒーローの背景ゴースト数字・イントロローダーの
 * 「3125」表記にのみ使う（見出し・本文の和文フォントは変更しない）。
 */
const alexBrush = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/assets/images/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/images/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/images/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/assets/images/apple-touch-icon.png",
  },
  verification: {
    google: "vC894d9n7Qld23gu9APr8GQltarCVxWioDa7MBIV2RQ",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0F0D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${cormorant.variable} ${shippori.variable} ${dmMono.variable} ${montserrat.variable} ${alexBrush.variable}`}
    >
      <body className="antialiased">
        <JsonLd data={organizationJsonLd()} />
        {children}
      </body>
    </html>
  );
}
