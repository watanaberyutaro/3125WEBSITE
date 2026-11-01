import Link from "next/link";

/**
 * 業種別・タグ別一覧の「ほかの○○を見る」索引（紙面版）。
 * 一覧が行き止まりにならないよう、同じ種類の項目と「すべて」へのリンクを並べる。
 */
export function TermNav({
  label,
  allHref,
  allLabel = "すべて",
  items,
  activeSlug,
  hrefFor,
  prefix = "",
}: {
  label: string;
  allHref: string;
  allLabel?: string;
  items: { name: string; slug: string }[];
  activeSlug: string;
  hrefFor: (slug: string) => string;
  prefix?: string;
}) {
  return (
    <nav className="term-nav" aria-label={label}>
      <p className="term-nav__label">{label}</p>
      <ul className="term-nav__list">
        <li>
          <Link href={allHref}>{allLabel}</Link>
        </li>
        {items.map((t) => (
          <li key={t.slug}>
            <Link
              href={hrefFor(t.slug)}
              className={t.slug === activeSlug ? "active" : undefined}
              aria-current={t.slug === activeSlug ? "page" : undefined}
            >
              {prefix}
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
