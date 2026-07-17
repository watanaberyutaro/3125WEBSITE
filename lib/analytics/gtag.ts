/**
 * GA4 (gtag.js) 送信ラッパー。
 * NEXT_PUBLIC_GA_MEASUREMENT_ID が未設定の間は全ての呼び出しが安全にno-opになる
 * （GA4プロパティ未発行の現状でもビルド・本番デプロイに一切影響しない設計）。
 *
 * 将来Supabaseへもイベントログを保存する場合は、trackEvent()の中に
 * fetch("/api/analytics/event", ...) を1箇所追加するだけで済むよう、
 * 呼び出し側（CtaButton・ContactForm等）は個々の送信手段を意識せずここだけを使う。
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function isReady(): boolean {
  return Boolean(GA_MEASUREMENT_ID) && typeof window !== "undefined" && typeof window.gtag === "function";
}

/**
 * App RouterはクライアントサイドナビゲーションのためGA4の自動page_view
 * （gtag('config', ...)実行時の1回のみ）だけでは2ページ目以降が計測されない。
 * AnalyticsPageViewからルート遷移のたびに呼び出す。
 */
export function pageview(url: string): void {
  if (!isReady()) return;
  window.gtag("event", "page_view", { page_path: url });
}

export type AnalyticsEventParams = Record<string, string | number | boolean | undefined>;

/** 全カスタムイベントの送信窓口。呼び出し側はgtagを直接叩かずここを使う。 */
export function trackEvent(name: string, params?: AnalyticsEventParams): void {
  if (!isReady()) return;
  window.gtag("event", name, params);
}
