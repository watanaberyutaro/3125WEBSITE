import Link from "next/link";
import Image from "next/image";
import type { ArticleListItem } from "@/lib/column/types";

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** お知らせ・コラム一覧（旧 news.php の .news-list 相当）。 */
export function ArticleList({ articles }: { articles: ArticleListItem[] }) {
  if (articles.length === 0) {
    return <div className="news-empty">該当する記事がありません。</div>;
  }

  return (
    <div className="news-list" role="list">
      {articles.map((article) => (
        <Link href={`/column/${article.slug}`} className="news-item" role="listitem" key={article.slug}>
          <div className="news-item__meta">
            <span
              className={`news-item__type news-item__type--${article.category?.slug ?? "news"}`}
            >
              {article.category?.name ?? "News"}
            </span>
            <time className="news-item__date" dateTime={article.publishedAt ?? undefined}>
              {formatDate(article.publishedAt)}
            </time>
          </div>
          <div className="news-item__body">
            {article.coverImageUrl && (
              <div className="news-item__thumb">
                <Image
                  src={article.coverImageUrl}
                  alt={article.title}
                  fill
                  sizes="180px"
                  loading="lazy"
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
            <div className="news-item__content">
              <p className="news-item__title">{article.title}</p>
              {article.excerpt && <p className="news-item__text">{article.excerpt}</p>}
              <span className="news-item__arrow">
                続きを読む
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path
                    d="M2 5h6M5 2l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
