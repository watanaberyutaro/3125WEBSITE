import { Suspense } from "react";
import { Cursor } from "@/components/motion/Cursor";
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
      <GoogleAnalytics />
      <Suspense fallback={null}>
        <AnalyticsPageView />
      </Suspense>
      <Cursor />
      <Nav />
      {children}
      <Footer />
    </>
  );
}
