import Link from "next/link";
import type { ArticleTagRef } from "@/lib/column/types";

export function ArticleTags({ tags }: { tags: ArticleTagRef[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="mb-10 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.slug}
          href={`/column/tag/${tag.slug}`}
          className="font-mono text-[11px] tracking-[0.06em] text-text-2"
          style={{ border: "1px solid var(--line)", padding: "4px 12px" }}
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
