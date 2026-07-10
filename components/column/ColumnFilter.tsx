import Link from "next/link";
import type { ArticleCategoryRef } from "@/lib/column/types";

export function ColumnFilter({
  categories,
  activeCategory,
  currentQuery,
}: {
  categories: ArticleCategoryRef[];
  activeCategory?: string;
  currentQuery?: string;
}) {
  const buildHref = (category?: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (currentQuery) params.set("q", currentQuery);
    const qs = params.toString();
    return qs ? `/column?${qs}` : "/column";
  };

  return (
    <div className="news-filter">
      <Link href={buildHref()} className={!activeCategory ? "active" : ""}>
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={buildHref(c.slug)}
          className={activeCategory === c.slug ? "active" : ""}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
