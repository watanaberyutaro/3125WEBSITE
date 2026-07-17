import { diffWords } from "diff";

/** 2つのバージョンの本文(Markdown)を単語単位で比較し、追加/削除箇所をハイライト表示する。 */
export function DraftVersionDiff({ oldText, newText }: { oldText: string; newText: string }) {
  const parts = diffWords(oldText, newText);

  if (parts.length === 1 && !parts[0].added && !parts[0].removed) {
    return <p className="text-[13px] text-text-3">前バージョンから本文の変更はありません。</p>;
  }

  return (
    <div className="whitespace-pre-wrap border border-line bg-bg p-4 text-[13px] leading-relaxed">
      {parts.map((part, i) => {
        if (part.added) {
          return (
            <mark key={i} style={{ background: "var(--green-4)", color: "var(--green)" }}>
              {part.value}
            </mark>
          );
        }
        if (part.removed) {
          return (
            <span key={i} style={{ background: "#f3e3df", color: "#b3432b", textDecoration: "line-through" }}>
              {part.value}
            </span>
          );
        }
        return <span key={i}>{part.value}</span>;
      })}
    </div>
  );
}
