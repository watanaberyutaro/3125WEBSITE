import Link from "next/link";
import Image from "next/image";
import type { WorkListItem } from "@/lib/works/types";
import { workCategoryLabel, workCategoryNote } from "./workCopy";

/**
 * 制作実績カード（紙面版の写真特集）。
 * - 写真はカラーのまま載せ、下に「写真説明」の体裁で分類・年・依頼主・業種を組む。
 * - lead はページの頭に大きく載せる1件（分類の説明文を添える）。
 * クラス名 work-card / work-card__thumb は、カーソルの VIEW 表示と写真の出現演出
 * （public/paper/main.js）が参照しているので残す。
 */
export function WorkCard({
  work,
  index,
  lead = false,
}: {
  work: WorkListItem;
  index: number;
  lead?: boolean;
}) {
  const num = String(work.sortOrder).padStart(2, "0");
  const categorySlug = work.category?.slug ?? "web";
  const label = workCategoryLabel(work.category);
  const note = lead ? workCategoryNote(work.category) : null;

  return (
    <Link
      className={`work-card wk${lead ? " wk--lead" : ""}`}
      href={`/works/${work.slug}`}
      data-cat={categorySlug}
      aria-label={`${work.clientName} ${work.projectName}`}
    >
      <div className="work-card__thumb wk__photo">
        {work.coverImageUrl ? (
          <Image
            src={work.coverImageUrl}
            alt=""
            fill
            sizes={
              lead
                ? "(max-width: 1100px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
            }
            loading={index < 3 ? "eager" : "lazy"}
            style={{ objectFit: "cover", objectPosition: "50% 0%" }}
          />
        ) : (
          <span className="wk__photo-empty" aria-hidden="true">
            {label}
          </span>
        )}
        <span className="wk__no" aria-hidden="true">
          No.{num}
        </span>
      </div>
      <div className="wk__body">
        {lead && <p className="wk__kicker">最新の仕事</p>}
        <p className="wk__meta">
          <span className="wk__cat">{label}</span>
          {work.year && <span className="wk__year">{work.year}年</span>}
        </p>
        <h3 className="wk__title">{work.projectName}</h3>
        <p className="wk__client">
          <span className="wk__k">依頼主</span>
          {work.clientName}
        </p>
        {lead && (
          <p className="wk__note">
            {note}
            制作の背景や担当した範囲は、詳細ページでご紹介しています。
          </p>
        )}
        <p className="wk__foot">
          <span className="wk__industry">
            {work.industry && (
              <>
                <span className="wk__k">業種</span>
                {work.industry.name}
              </>
            )}
          </span>
          <span className="wk__more">
            詳しく読む<span aria-hidden="true">→</span>
          </span>
        </p>
      </div>
    </Link>
  );
}
