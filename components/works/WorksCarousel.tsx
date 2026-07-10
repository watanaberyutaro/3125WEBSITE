"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { WorkListItem } from "@/lib/works/types";

/** Home画面の実績カルーセル（旧 initWorksCarousel 相当）。ドラッグスクロール・矢印ボタン・スクロールバー同期。 */
export function WorksCarousel({ works }: { works: WorkListItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track) return;

    const syncThumb = () => {
      if (!thumb) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const pct = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
      const barW = thumb.parentElement ? thumb.parentElement.clientWidth : 0;
      const thumbW = barW > 0 ? Math.max(28, barW * (track.clientWidth / track.scrollWidth)) : 0;
      thumb.style.width = `${thumbW}px`;
      thumb.style.left = `${pct * (barW - thumbW)}px`;
    };

    track.addEventListener("scroll", syncThumb, { passive: true });
    window.addEventListener("resize", syncThumb, { passive: true });
    const t = setTimeout(syncThumb, 120);

    let isDragging = false;
    let dragStartX = 0;
    let dragScrollLeft = 0;
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragScrollLeft = track.scrollLeft;
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      track.scrollLeft = dragScrollLeft - (e.clientX - dragStartX);
    };
    track.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      clearTimeout(t);
      track.removeEventListener("scroll", syncThumb);
      window.removeEventListener("resize", syncThumb);
      track.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".wc__card");
    const cw = card ? card.offsetWidth + 24 : 0;
    if (!cw) return;
    track.scrollBy({ left: dir * cw, behavior: "smooth" });
  };

  return (
    <div className="wc" id="worksCarousel" role="region" aria-label="制作実績カルーセル">
      <div className="wc__track" id="wcTrack" ref={trackRef}>
        {works.map((work, i) => (
          <Link className="wc__card" href={`/works/${work.slug}`} key={work.slug}>
            <div className="wc__thumb">
              {work.coverImageUrl ? (
                <Image
                  src={work.coverImageUrl}
                  alt={`${work.clientName} ${work.projectName}`}
                  fill
                  sizes="(max-width: 768px) 80vw, 360px"
                  loading={i < 2 ? "eager" : "lazy"}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#1a1a1a" }} />
              )}
              <div className="wc__thumb-over" aria-hidden="true">
                <span className="wc__view">View Project</span>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M2 6.5h9M7 2.5l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="wc__info">
              <p className="wc__num">{String(work.sortOrder).padStart(2, "0")}</p>
              <h3 className="wc__title">
                {work.clientName}
                <br />
                {work.projectName}
              </h3>
              <p className="wc__cat">
                <span className="wc__dot" aria-hidden="true" />
                {work.category?.name ?? "Web"} · {work.year}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="wc__foot">
        <button className="wc__btn" aria-label="前へ" onClick={() => scrollByCard(-1)} type="button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="wc__scrollbar" role="presentation">
          <div className="wc__scrollbar-thumb" ref={thumbRef} />
        </div>
        <button className="wc__btn" aria-label="次へ" onClick={() => scrollByCard(1)} type="button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
