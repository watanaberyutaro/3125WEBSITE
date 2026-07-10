import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "./ArrowIcon";

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
  return (
    <Link href={href} className={["link-arrow", className].filter(Boolean).join(" ")}>
      {children}
      <ArrowIcon />
    </Link>
  );
}
