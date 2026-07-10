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
   * ここに置くのは「固定・既知・今後増えない」1:1マッピングのみ（旧サイトの
   * 静的.htmlファイルは全て移行済みでこれ以上増えない）。
   * work-detail.php?id=... や news-detail.php?id=... のようにクエリ文字列で
   * 対象データが変わるリダイレクトは、middleware.ts + Supabase redirects
   * テーブルの方で解決する（コード変更・再デプロイなしで追加できるようにするため）。
   */
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/company.html", destination: "/company", permanent: true },
      { source: "/services.html", destination: "/services", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/works.html", destination: "/works", permanent: true },
      { source: "/works.php", destination: "/works", permanent: true },
      { source: "/news.php", destination: "/column", permanent: true },
      { source: "/work-01.html", destination: "/works/work-01", permanent: true },
      { source: "/work-02.html", destination: "/works/work-02", permanent: true },
      { source: "/work-03.html", destination: "/works/work-03", permanent: true },
      { source: "/work-04.html", destination: "/works/work-04", permanent: true },
      { source: "/work-05.html", destination: "/works/work-05", permanent: true },
      { source: "/work-06.html", destination: "/works/work-06", permanent: true },
      { source: "/work-07.html", destination: "/works/work-07", permanent: true },
    ];
  },
};

export default nextConfig;
