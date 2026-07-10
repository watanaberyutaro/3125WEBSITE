import Link from "next/link";
import type { ArticleCategoryRef } from "@/lib/column/types";

/**
 * /column（検索と組み合わせ可能）では ?category=... のクエリ文字列を使い、
 * /column/category/[category]（SEO用のクリーンURL・サイトマップにも掲載）では
 * クリーンURL同士を行き来できるようにする。WorksFilterと同じ理由。
 */
export function ColumnFilter({
  categories,
  activeCategory,
  currentQuery,
  useCleanUrls = false,
}: {
  categories: ArticleCategoryRef[];
  activeCategory?: string;
  currentQuery?: string;
  useCleanUrls?: boolean;
}) {
  const buildHref = (category?: string) => {
    if (useCleanUrls) {
      return category ? `/column/category/${category}` : "/column";
    }
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
