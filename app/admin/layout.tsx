/**
 * /admin配下全体（loginページ含む）に共通のルートラッパー。
 * legacy-site.cssの `* { cursor: none }` はカスタムカーソル(<Cursor />)と
 * セットで(site)レイアウトにのみ意図したルールだが、Reactのroot layoutで
 * グローバルに読み込まれるため管理画面にも適用されてしまい、<Cursor />を
 * 描画していない管理画面ではマウスカーソルが完全に非表示になっていた。
 * ここでid付きのラッパーを用意し、CSS側でこのスコープのみカーソル表示を
 * 通常状態に戻す。
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div id="admin-root">{children}</div>;
}
