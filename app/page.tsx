import { siteConfig } from "@/lib/site-config";

/**
 * Phase 0時点の仮トップページ。
 * Nav/Footer・Hero・Works/News抜粋等の本実装はPhase 1で行う。
 * ここではフォント・デザイントークン・Tailwindパイプラインの疎通確認が目的。
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <p className="font-mono text-[11px] tracking-[0.16em] text-green uppercase">
        Phase 0 — Scaffold Check
      </p>
      <h1 className="font-jp text-3xl font-medium text-text sm:text-4xl">
        {siteConfig.name}
      </h1>
      <p className="max-w-md font-jp text-sm leading-loose text-text-2">
        {siteConfig.tagline}
      </p>
    </main>
  );
}
