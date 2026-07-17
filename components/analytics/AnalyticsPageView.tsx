"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { GA_MEASUREMENT_ID, pageview } from "@/lib/analytics/gtag";

/**
 * App Routerのクライアントサイド遷移ごとにGA4のpage_viewを手動送信する。
 * useSearchParams使用のためSuspense境界内での利用が必須
 * （app/(site)/layout.tsxで<Suspense>にラップして配置）。
 */
export function AnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    const query = searchParams.toString();
    pageview(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  return null;
}
