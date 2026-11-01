"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * 紙面版（Paper edition）のモーション層を読み込む。
 * 実体は public/paper/ の素のJS（GSAP + ScrollTrigger + Lenis、ホームのみthree.jsとオープニング）。
 * 依存順が厳密なので next/script ではなく、ここで1本ずつ順番に読み込む。
 * 内部リンクは main.js がシャッター演出つきの通常遷移に置き換えるため、基本は1ページ=1回の初期化。
 * router.push 等でクライアント遷移した場合だけ、演出の状態を作り直すために再読み込みする。
 */
const load = (src: string, module = false) =>
  new Promise<void>((resolve) => {
    const s = document.createElement("script");
    s.src = src;
    if (module) s.type = "module";
    else s.async = false;
    s.onload = s.onerror = () => resolve();
    document.body.appendChild(s);
  });

export function PaperRuntime() {
  const pathname = usePathname();
  const booted = useRef<string | null>(null);

  useEffect(() => {
    if (booted.current !== null) {
      if (booted.current !== pathname) window.location.reload();
      return;
    }
    booted.current = pathname;
    (async () => {
      await load("/paper/vendor/gsap.min.js");
      await load("/paper/vendor/ScrollTrigger.min.js");
      await load("/paper/vendor/lenis.min.js");
      if (pathname === "/") {
        await load("/paper/intro.js", true);
        await load("/paper/objects.js", true);
      }
      await load("/paper/main.js");
    })();
  }, [pathname]);

  return null;
}
