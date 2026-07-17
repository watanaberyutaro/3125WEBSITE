"use client";

import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/gtag";

/**
 * GA4 (gtag.js) 読み込み。NEXT_PUBLIC_GA_MEASUREMENT_ID未設定時は何も描画しない
 * （GA4プロパティ発行前でもビルド・本番デプロイに影響しない）。
 * send_page_view:false で自動page_viewを止め、AnalyticsPageView側で
 * App Routerのクライアント遷移ごとに手動発火する。
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
          window.gtag = gtag;
        `}
      </Script>
    </>
  );
}
