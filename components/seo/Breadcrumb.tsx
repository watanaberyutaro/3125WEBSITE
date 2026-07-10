import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo/jsonld";

/**
 * パンくずリスト。旧サイトには無かった新規UI要素のため、ブランドトークンに
 * 沿ったTailwindユーティリティで実装する（legacy-site.cssは変更しない）。
 * 表示とJSON-LDを同じitems配列から生成し、内容の不一致を防ぐ。
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="パンくずリスト"
      className="mx-auto max-w-[var(--max-w)] px-[var(--px)] pt-8"
    >
      <JsonLd data={breadcrumbJsonLd(items)} />
      <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-text-3">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-text-2">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-green">
                  {item.name}
                </Link>
              )}
              {!isLast && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
