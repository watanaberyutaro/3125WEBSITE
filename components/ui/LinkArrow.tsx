"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowIcon } from "./ArrowIcon";
import { trackEvent } from "@/lib/analytics/gtag";

/** `.link-arrow` パターン（テキスト + 矢印）。ページ内の各所で繰り返し使われる軽量リンク。 */
export function LinkArrow({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  const handleClick = () => {
    trackEvent("cta_click", {
      cta_label: typeof children === "string" ? children : href,
      cta_location: pathname,
      cta_destination: href,
      cta_variant: "link-arrow",
    });
  };

  return (
    <Link href={href} className={["link-arrow", className].filter(Boolean).join(" ")} onClick={handleClick}>
      {children}
      <ArrowIcon />
    </Link>
  );
}
