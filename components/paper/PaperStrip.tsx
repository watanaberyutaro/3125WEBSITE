import type { PaperSection } from "@/lib/paper/sections";

/** 紙面版: ページ上部の題字帯（題字・面・日付）。日付は main.js が当日の日付で埋める。 */
export function PaperStrip({ section, solo = false }: { section: PaperSection; solo?: boolean }) {
  return (
    <div className={`page-hero__strip${solo ? " page-hero__strip--solo" : ""}`}>
      <span className="page-hero__strip-title">The 3125 Times</span>
      <span className="page-hero__strip-section">
        {section.men}　{section.section}
      </span>
      <span className="page-hero__strip-date" data-today="" suppressHydrationWarning />
    </div>
  );
}
