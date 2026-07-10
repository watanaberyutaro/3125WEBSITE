import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  /**
   * 旧URL → 新URLの301リダイレクト。
   * ここに置くのは「固定・既知」の1:1マッピングのみ。
   * work-0X.html や news-detail.php?id=... のようにデータに紐づく動的な
   * リダイレクトは、Phase 2で構築する middleware.ts + Supabase redirects
   * テーブルの方で解決する（コード変更・再デプロイなしで追加できるようにするため）。
   */
  async redirects() {
    return [
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/company.html", destination: "/company", permanent: true },
      { source: "/services.html", destination: "/services", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/works.php", destination: "/works", permanent: true },
      { source: "/news.php", destination: "/column", permanent: true },
    ];
  },
};

export default nextConfig;
