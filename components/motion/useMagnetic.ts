"use client";

import { useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

/**
 * カーソルにわずかに吸い付くボタン挙動（旧 initMagnetic 相当）を
 * 既存のトップレベル要素(a/button)へ直接付与するためのフック。
 * 余分なラッパー要素を挟まず、CTAボタンの元のDOM構造を維持する。
 */
export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onMouseMove = (e: ReactMouseEvent<T>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = ((e.clientX - r.left) / r.width - 0.5) * 16;
    const dy = ((e.clientY - r.top) / r.height - 0.5) * 9;
    el.style.transform = `translate(${dx}px, ${dy}px) translateY(-1px)`;
  };

  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return { ref, onMouseMove, onMouseLeave };
}
