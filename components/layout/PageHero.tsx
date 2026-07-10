"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "@/components/motion/Reveal";

/**
 * 内側ページ共通のヒーロー（旧 .page-hero）。
 * 背景の装飾英字は旧 initParallax 相当でスクロールに応じてtranslateYする。
 */
export function PageHero({
  eyebrowNum,
  label,
  title,
  description,
}: {
  eyebrowNum: string;
  label: string;
  title: string;
  description: string;
}) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (numRef.current) numRef.current.style.transform = `translateY(${window.scrollY * 0.1}px)`;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="page-hero" aria-labelledby="page-heading">
      <span className="page-hero__num" ref={numRef} aria-hidden="true">
        {eyebrowNum}
      </span>
      <div className="page-hero__inner">
        <div>
          <Reveal as="p" className="label page-hero__label">
            {label}
          </Reveal>
          <Reveal as="h1" delay={1} className="heading-xl page-hero__title" id="page-heading">
            {title}
          </Reveal>
        </div>
        <Reveal as="p" delay={2} className="page-hero__desc">
          {description}
        </Reveal>
      </div>
    </header>
  );
}
