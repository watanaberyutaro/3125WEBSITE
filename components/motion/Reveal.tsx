"use client";

import { useEffect, useRef } from "react";

type RevealTag = "div" | "article" | "header" | "h1" | "h2" | "h3" | "p" | "ul" | "aside" | "section";

type RevealProps = {
  children: React.ReactNode;
  /** up: 下からフェードイン(既定) / left,right: 横からスライドイン */
  variant?: "up" | "left" | "right";
  /** 0.08s刻みのstagger遅延(1〜5) */
  delay?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  /** 実際に描画するタグ。ラッパーdivを増やさず、その要素自体にreveal挙動を付与する。 */
  as?: RevealTag;
  id?: string;
  role?: string;
};

const variantClass = { up: "reveal", left: "reveal-l", right: "reveal-r" } as const;

/**
 * スクロールで要素をフェード/スライドインさせる（旧 js/main.js の initReveal 相当）。
 * IntersectionObserverで画面内に入ったら .in を付与し、legacy-site.cssの
 * .reveal / .reveal-l / .reveal-r トランジションを発火させる。
 * 旧サイトはreveal系クラスを対象要素へ直接付与していたため、ここでも
 * 余分なラッパーを挟まず `as` で指定した実タグへ直接クラスを乗せる。
 */
export function Reveal({
  children,
  variant = "up",
  delay,
  className,
  as = "div",
  id,
  role,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const classes = [variantClass[variant], delay ? `d${delay}` : "", className]
    .filter(Boolean)
    .join(" ");

  const Tag = as as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={classes} id={id} role={role}>
      {children}
    </Tag>
  );
}
