import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Shippori_Mincho_B1, DM_Mono, Montserrat } from "next/font/google";
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
    <html lang="ja">
      <body
        className={`${cormorant.variable} ${shippori.variable} ${dmMono.variable} ${montserrat.variable} antialiased`}
      >
        <JsonLd data={organizationJsonLd()} />
        {children}
      </body>
    </html>
  );
}
