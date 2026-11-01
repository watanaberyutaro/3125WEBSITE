"use client";

import { usePathname } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { PaperStrip } from "@/components/paper/PaperStrip";
import { paperSectionFor } from "@/lib/paper/sections";

/**
 * 内側ページ共通のヒーロー（紙面版）。
 * 題字帯 → 面の大見出し → 黒帯の見出し → リード、右段にインクの挿絵とキャプション。
 * 背景の装飾英字のスクロール移動は public/paper/main.js（initDrift）が担当する。
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
  const section = paperSectionFor(usePathname());

  return (
    <header className="page-hero" aria-labelledby="page-heading">
      {section && <PaperStrip section={section} />}
      <span className="page-hero__num" aria-hidden="true">
        {section?.plate ?? eyebrowNum}
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
      {section && (
        <figure className="page-hero__figure">
          <div className="page-hero__stage page-hero__stage--ink" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ink-art" src={`/assets/images/${section.art}`} alt="" decoding="async" />
          </div>
          <figcaption className="page-hero__caption">【図】{section.caption}</figcaption>
        </figure>
      )}
    </header>
  );
}
