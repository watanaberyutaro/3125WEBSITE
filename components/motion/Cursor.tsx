"use client";

import { useEffect, useRef } from "react";

const HOVER_SELECTOR =
  "a, button, [tabindex], .work-card, .service-item, .filter-btn, .contact-chip, .concept-panel";

/** カスタムカーソル。ポインターデバイスがcoarse(タッチ)の場合は非表示（旧 initCursor 相当）。 */
export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    if (window.matchMedia("(pointer: coarse)").matches) {
      cursor.style.display = "none";
      return;
    }

    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = cx;
    let ty = cy;
    let raf = 0;

    const handleMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    document.addEventListener("mousemove", handleMove, { passive: true });

    function moveCursor() {
      if (!cursor) return;
      cx += (tx - cx) * 0.13;
      cy += (ty - cy) * 0.13;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      raf = requestAnimationFrame(moveCursor);
    }
    raf = requestAnimationFrame(moveCursor);

    // イベント委譲（document単位）にすることで、ページ遷移後に追加されたDOMにも
    // 個別listener再登録なしで反応する（Reveal同様、レイアウトは画面遷移で再マウントされないため）。
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(HOVER_SELECTOR)) cursor.classList.add("hover");
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(HOVER_SELECTOR)) cursor.classList.remove("hover");
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    const onDown = () => cursor.classList.add("click");
    const onUp = () => cursor.classList.remove("click");
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  return <div className="cursor" id="cursor" ref={cursorRef} aria-hidden="true" />;
}
