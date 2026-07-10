import { Reveal } from "@/components/motion/Reveal";
import { LinkArrow } from "@/components/ui/LinkArrow";

/** セクション見出し（縦積み）。旧 .section__header。 */
export function SectionHeader({
  num,
  label,
  title,
  body,
  id,
}: {
  num: string;
  label: string;
  title: string;
  body?: string;
  id?: string;
}) {
  return (
    <Reveal as="div" className="section__header">
      <p className="section__num">{num}</p>
      <p className="label section__label">{label}</p>
      <h2 className="heading-lg section__title" id={id}>
        {title}
      </h2>
      {body && <p className="section__body">{body}</p>}
    </Reveal>
  );
}

/** セクション見出し（横並び + 右側「すべて見る」リンク）。旧 .section__header--row。Homeで使用。 */
export function SectionHeaderRow({
  num,
  label,
  title,
  moreHref,
  id,
}: {
  num: string;
  label: string;
  title: string;
  moreHref: string;
  id?: string;
}) {
  return (
    <div className="section__header--row">
      <div>
        <p className="section__num">{num}</p>
        <p className="label section__label">{label}</p>
        <Reveal as="h2" className="heading-lg section__title" id={id}>
          {title}
        </Reveal>
      </div>
      <Reveal as="div">
        <LinkArrow href={moreHref}>すべて見る</LinkArrow>
      </Reveal>
    </div>
  );
}
