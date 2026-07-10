import Link from "next/link";
import type { ArticleListItem } from "@/lib/column/types";

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** Home画面のお知らせ抜粋（旧 index.php の .hn__list 相当）。 */
export function HomeNewsList({ articles }: { articles: ArticleListItem[] }) {
  return (
    <ul className="hn__list reveal" role="list">
      {articles.map((a) => (
        <li className="hn__item" role="listitem" key={a.slug}>
          <Link href={`/column/${a.slug}`} className="hn__row hn__row--link">
            <time className="hn__date" dateTime={a.publishedAt ?? undefined}>
              {formatDate(a.publishedAt)}
            </time>
            <span className={`hn__badge hn__badge--${a.category?.slug ?? "news"}`}>
              {(a.category?.name ?? "News").toUpperCase()}
            </span>
            <span className="hn__title">{a.title}</span>
            <svg className="hn__arrow" width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path
                d="M2 5.5h7M6 2.5l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  );
}
