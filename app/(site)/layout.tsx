import { Suspense } from "react";
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
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
