import { RevealGrid } from "@/components/motion/RevealGrid";
import { WorkCard } from "./WorkCard";
import type { WorkListItem } from "@/lib/works/types";

export function WorksGrid({ works }: { works: WorkListItem[] }) {
  if (works.length === 0) {
    return (
      <div className="works-grid">
        <p style={{ color: "var(--text-3)", gridColumn: "1/-1", padding: "40px 0" }}>
          該当する制作実績がありません。
        </p>
      </div>
    );
  }

  return (
    <RevealGrid className="works-grid">
      {works.map((work, i) => (
        <WorkCard work={work} index={i} key={work.slug} />
      ))}
    </RevealGrid>
  );
}
