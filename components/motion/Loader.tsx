"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site-config";

const VISITED_KEY = "3125_visited";
const PROG_START = 400;
const PROG_DURATION = 1700;

type Phase = "hidden" | "running" | "exit" | "done";

/**
 * 初回訪問時のみ表示するイントロローディング画面（旧 #loader / initLoader 相当）。
 * テキストの順次表示は legacy-site.css の @keyframes(loader-brand-in等)が担当するため、
 * ここではsessionStorageによる表示判定とプログレスバーの進行のみを制御する。
 */
export function Loader() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem(VISITED_KEY)) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem(VISITED_KEY, "1");
    setPhase("running");
    document.body.style.overflow = "hidden";

    let rafStart: number | null = null;
    let raf = 0;

    const tick = (ts: number) => {
      if (rafStart === null) rafStart = ts;
      const progress = Math.min(((ts - rafStart) / PROG_DURATION) * 100, 100);
      setPct(Math.round(progress));
      if (progress < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setPhase("exit");
          document.body.style.overflow = "";
          setTimeout(() => setPhase("done"), 1000);
        }, 260);
      }
    };

    const startTimer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, PROG_START);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "hidden" || phase === "done") return null;

  return (
    <div
      className={`loader${phase === "exit" ? " exit" : ""}`}
      role="status"
      aria-label="読み込み中"
      aria-live="polite"
    >
      <div className="loader__inner">
        <p className="loader__brand">3125</p>
        <p className="loader__kaisha">株式会社</p>
        <div className="loader__rule" aria-hidden="true" />
        <p className="loader__motto">{siteConfig.tagline}</p>
        <div className="loader__prog">
          <div className="loader__prog-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="loader__meta">
          <span>AI × Business · Tokyo</span>
          <span className="loader__pct">{pct}%</span>
        </div>
      </div>
    </div>
  );
}
