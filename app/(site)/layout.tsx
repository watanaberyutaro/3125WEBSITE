import { Suspense } from "react";
import { preload } from "react-dom";
import { PaperRuntime } from "@/components/paper/PaperRuntime";
import "@/styles/paper-site.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { AnalyticsPageView } from "@/components/analytics/AnalyticsPageView";

/**
 * 一般公開ページ共通レイアウト。/admin・/api配下はこのグループに含めない
 * （計測も公開マーケティングページのみを対象にし、管理画面の操作は追わない）。
 */
/* 紙面版の動きのスクリプトは PaperRuntime が順番に実行するが、ダウンロードは
   ページの読み込みと並行して先に始めておく（遷移後に幕が上がるまでの待ちを縮める） */
const PAPER_SCRIPTS = [
  "/paper/vendor/gsap.min.js",
  "/paper/vendor/ScrollTrigger.min.js",
  "/paper/vendor/lenis.min.js",
  "/paper/main.js",
];

/* 対応ブラウザ（Chrome 系）では、リンクにカーソルを乗せた時点で遷移先を先読みする */
const SPECULATION_RULES = JSON.stringify({
  prefetch: [
    {
      where: {
        and: [
          { href_matches: "/*" },
          { not: { href_matches: "/admin*" } },
          { not: { href_matches: "/api/*" } },
          { not: { href_matches: "/*.xml" } },
        ],
      },
      eagerness: "moderate",
    },
  ],
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  PAPER_SCRIPTS.forEach((src) => preload(src, { as: "script" }));
  return (
    <>
      <script type="speculationrules" dangerouslySetInnerHTML={{ __html: SPECULATION_RULES }} />
      {/* 紙面版: 初回のみホームでオープニングを流す／シャッター遷移の続きを出す（描画前に判定） */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(d){try{if(location.pathname==='/'&&!sessionStorage.getItem('3125_visited'))d.classList.add('has-loader');if(sessionStorage.getItem('3125_veil')){d.classList.add('is-veiled');sessionStorage.removeItem('3125_veil');}}catch(e){}})(document.documentElement);",
        }}
      />
      <GoogleAnalytics />
      <Suspense fallback={null}>
        <AnalyticsPageView />
      </Suspense>
      <div className="cursor" id="cursor" aria-hidden="true" />
      <Nav />
      {children}
      <Footer />
      <PaperRuntime />
    </>
  );
}
