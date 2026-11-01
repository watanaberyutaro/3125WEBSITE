import { RevealGrid } from "@/components/motion/RevealGrid";
import { WorkCard } from "./WorkCard";
import { workCategoryLabel } from "./workCopy";
import type { WorkListItem } from "@/lib/works/types";

/**
 * 制作実績の一覧（紙面版の写真特集）。
 * - layout="list"（一覧ページ）: 先頭の1件を横長の大きな扱いにし、残りを3段組で並べる。
 *   上に掲載件数・分類ごとの件数・掲載年の幅を「目次」として添える。
 * - layout="feature"（ホーム）: 先頭を2段抜きの大写真、右に2件、下に3件の6件組。
 */
export function WorksGrid({
  works,
  layout = "list",
  summary = layout === "list",
}: {
  works: WorkListItem[];
  layout?: "list" | "feature";
  summary?: boolean;
}) {
  if (works.length === 0) {
    return (
      <p className="wk-empty">
        該当する制作実績はまだありません。ほかの分類・業種もあわせてご覧ください。
      </p>
    );
  }

  const hasLead = works.length >= 4;

  return (
    <>
      {summary && <WorksSummary works={works} />}
      <RevealGrid className={`wk-grid wk-grid--${layout}${hasLead ? " has-lead" : ""}`}>
        {works.map((work, i) => (
          <WorkCard work={work} index={i} lead={hasLead && i === 0} key={work.slug} />
        ))}
      </RevealGrid>
    </>
  );
}

function WorksSummary({ works }: { works: WorkListItem[] }) {
  const counts = new Map<string, number>();
  for (const w of works) {
    const label = workCategoryLabel(w.category);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const years = works
    .map((w) => Number(w.year))
    .filter((y) => Number.isFinite(y) && y > 0);
  const from = years.length ? Math.min(...years) : null;
  const to = years.length ? Math.max(...years) : null;

  return (
    <dl className="wk-summary">
      <div>
        <dt>掲載</dt>
        <dd>
          <span>
            <strong>{works.length}</strong>件
          </span>
        </dd>
      </div>
      <div>
        <dt>内訳</dt>
        <dd>
          {[...counts].map(([label, n]) => (
            <span key={label}>
              {label}
              <b>{n}</b>
            </span>
          ))}
        </dd>
      </div>
      {from && to && (
        <div>
          <dt>期間</dt>
          <dd>{from === to ? `${from}年` : `${from}年〜${to}年`}</dd>
        </div>
      )}
    </dl>
  );
}
