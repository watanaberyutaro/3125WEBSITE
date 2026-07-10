import Link from "next/link";
import type { WorkCategoryRef } from "@/lib/works/types";

/**
 * カテゴリフィルタタブ。JS無しでも機能するようリンクとして実装し、
 * サーバー側(app/(site)/works/page.tsx)でSupabaseへのクエリに反映する。
 *
 * /works（検索と組み合わせ可能）では ?category=... のクエリ文字列を使い、
 * /works/category/[category]（SEO用のクリーンURL・サイトマップにも掲載）では
 * そのままクリーンURL同士を行き来できるようにする。片方に固定すると、
 * もう片方のページに来たユーザーがタブを押した瞬間に別URL形式へ飛ばされてしまうため。
 */
export function WorksFilter({
  categories,
  activeCategory,
  currentQuery,
  useCleanUrls = false,
}: {
  categories: WorkCategoryRef[];
  activeCategory?: string;
  currentQuery?: string;
  useCleanUrls?: boolean;
}) {
  const buildHref = (category?: string) => {
    if (useCleanUrls) {
      return category ? `/works/category/${category}` : "/works";
    }
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
