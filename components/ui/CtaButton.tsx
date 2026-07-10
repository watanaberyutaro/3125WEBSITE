"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "./ArrowIcon";
import { useMagnetic } from "@/components/motion/useMagnetic";

type Variant = "gold" | "outline" | "outline-gold";

type CtaButtonProps = {
  href: string;
  variant: Variant;
  children: ReactNode;
  /**
   * 旧サイトでは `.btn--gold` と `.home-cta`内の`.btn`のみがマグネティック効果を持つ。
   * 呼び出し側でこの条件に合わせて明示的に指定する。
   */
  magnetic?: boolean;
  /** アイコン表示。省略時は gold/outline-gold で表示、outlineのみ非表示（旧サイトの実際の使い分けに合わせる） */
  icon?: boolean;
  className?: string;
};

function isExternalHref(href: string) {
  return (
    href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")
  );
}

export function CtaButton({
  href,
  variant,
  children,
  magnetic = false,
  icon,
  className,
}: CtaButtonProps) {
  const showIcon = icon ?? variant !== "outline";
  const { ref, onMouseMove, onMouseLeave } = useMagnetic<HTMLAnchorElement>();
  const classes = ["btn", `btn--${variant}`, className].filter(Boolean).join(" ");
  const handlers = magnetic ? { onMouseMove, onMouseLeave } : {};

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        className={classes}
        ref={magnetic ? ref : undefined}
        {...handlers}
      >
        {children}
        {showIcon && <ArrowIcon />}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} ref={magnetic ? ref : undefined} {...handlers}>
      {children}
      {showIcon && <ArrowIcon />}
    </Link>
  );
}
