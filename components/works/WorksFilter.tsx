import Link from "next/link";
import type { WorkCategoryRef } from "@/lib/works/types";

/**
 * カテゴリフィルタタブ。JS無しでも機能するようリンク(?category=...)として実装し、
 * サーバー側(app/(site)/works/page.tsx)でSupabaseへのクエリに反映する。
 */
export function WorksFilter({
  categories,
  activeCategory,
  currentQuery,
}: {
  categories: WorkCategoryRef[];
  activeCategory?: string;
  currentQuery?: string;
}) {
  const buildHref = (category?: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (currentQuery) params.set("q", currentQuery);
    const qs = params.toString();
    return qs ? `/works?${qs}` : "/works";
  };

  return (
    <div className="works-filter" role="tablist" aria-label="カテゴリーフィルター">
      <Link
        href={buildHref()}
        className={`filter-btn${!activeCategory ? " active" : ""}`}
        role="tab"
        aria-selected={!activeCategory}
      >
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={buildHref(c.slug)}
          className={`filter-btn${activeCategory === c.slug ? " active" : ""}`}
          role="tab"
          aria-selected={activeCategory === c.slug}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
