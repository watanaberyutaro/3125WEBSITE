import { Cursor } from "@/components/motion/Cursor";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

/**
 * 一般公開ページ共通レイアウト。/admin・/api配下はこのグループに含めない。
 * id="site-root"はapp/globals.cssの全称リセット(margin/padding/box-sizingの初期化)
 * のスコープに使う。管理画面(#admin-root)はTailwindの余白ユーティリティクラスで
 * 余白を組んでいるため、そちらまでリセット対象にするとユーティリティが軒並み無効化されて
 * しまう（実際に発生した不具合）。:not()による除外はNext.jsのビルドで不安定に消える
 * ことを確認したため使わず、公開サイト側だけを明示的に対象範囲に含める形にしている。
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="site-root">
      <Cursor />
      <Nav />
      {children}
      <Footer />
    </div>
  );
}
