import type { ToolOutput } from "@/lib/tools/types";

/** 全ツール共通の結果表示。ToolOutputのどのフィールドが埋まっているかで出し分ける。 */
export function ToolResult({ output }: { output: ToolOutput }) {
  return (
    <div className="tool-result" aria-live="polite">
      <h3 className="tool-result__title">生成結果</h3>

      {output.summary && <p className="tool-result__summary">{output.summary}</p>}

      {output.priceRange && (
        <p className="tool-result__price">
          {output.priceRange.min.toLocaleString()}円 〜 {output.priceRange.max.toLocaleString()}円
          <span className="tool-result__price-label">（税別・概算）</span>
        </p>
      )}

      {output.items && (
        <ul className="tool-result__list" role="list">
          {output.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}

      {output.qa && (
        <dl className="tool-result__qa">
          {output.qa.map((f, i) => (
            <div className="tool-result__qa-item" key={i}>
              <dt>Q. {f.question}</dt>
              <dd>A. {f.answer}</dd>
            </div>
          ))}
        </dl>
      )}

      {(output.priceRange?.note || output.note) && (
        <p className="tool-result__note">
          {output.priceRange?.note && <>{output.priceRange.note}</>}
          {output.priceRange?.note && output.note && "／"}
          {output.note}
        </p>
      )}
    </div>
  );
}
