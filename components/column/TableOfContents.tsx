"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/column/markdown";

/** 記事本文の見出しから自動生成する目次（新規機能）。スクロール位置に応じて現在地をハイライトする。 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="目次"
      className="mb-10 border border-line bg-bg-2 p-6"
      style={{ fontFamily: "var(--font-jp)" }}
    >
      <p className="mb-3 font-mono text-[10px] tracking-[0.16em] text-text-3 uppercase">目次</p>
      <ol className="flex flex-col gap-2">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? 16 : 0 }}>
            <a
              href={`#${h.id}`}
              className="text-[13px] leading-relaxed"
              style={{ color: activeId === h.id ? "var(--green)" : "var(--text-2)" }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
