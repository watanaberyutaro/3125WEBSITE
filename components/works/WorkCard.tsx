import Link from "next/link";
import Image from "next/image";
import type { WorkListItem } from "@/lib/works/types";

export function WorkCard({ work, index }: { work: WorkListItem; index: number }) {
  const num = String(work.sortOrder).padStart(2, "0");
  const categorySlug = work.category?.slug ?? "web";

  return (
    <Link
      className="work-card"
      href={`/works/${work.slug}`}
      data-cat={categorySlug}
      aria-label={`${work.clientName} ${work.projectName}`}
    >
      <div className="work-card__thumb">
        {work.coverImageUrl ? (
          <Image
            src={work.coverImageUrl}
            alt={`${work.clientName} ${work.projectName}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading={index < 3 ? "eager" : "lazy"}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#1a1a1a" }} />
        )}
      </div>
      <div className="work-card__top">
        <span className="work-card__label">{work.category?.name ?? "Web"}</span>
        <span className="work-card__year">{work.year}</span>
      </div>
      <p className="work-card__num">{num}</p>
      <h3 className="work-card__name">
        {work.clientName}
        <br />
        {work.projectName}
      </h3>
      <div className="work-card__foot">
        <span className="work-card__industry">{work.industry?.name}</span>
        <span className="work-card__arrow">→</span>
      </div>
    </Link>
  );
}
