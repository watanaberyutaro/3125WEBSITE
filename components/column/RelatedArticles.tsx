import Link from "next/link";
import Image from "next/image";
import type { ArticleListItem } from "@/lib/column/types";

/** 関連記事（新規機能）。related_article_ids優先、無ければ同カテゴリから自動補完。 */
export function RelatedArticles({ articles }: { articles: ArticleListItem[] }) {
  if (articles.length === 0) return null;

  return (
    <section
      aria-label="関連記事"
      className="mx-auto max-w-[800px] px-[var(--px)] pb-20"
    >
      <p className="mb-5 font-mono text-[10px] tracking-[0.16em] text-text-3 uppercase">
        Related Articles
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {articles.map((a) => (
          <Link
            href={`/column/${a.slug}`}
            key={a.slug}
            className="flex flex-col gap-3 border border-line p-4 transition-colors hover:border-green"
          >
            {a.coverImageUrl && (
              <div className="relative aspect-video w-full overflow-hidden bg-bg-3">
                <Image src={a.coverImageUrl} alt={a.title} fill sizes="240px" style={{ objectFit: "cover" }} />
              </div>
            )}
            <p className="text-[13px] leading-relaxed font-medium text-text" style={{ fontFamily: "var(--font-jp)" }}>
              {a.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
