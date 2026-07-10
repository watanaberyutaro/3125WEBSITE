/**
 * 無限スクロールのマーキー帯（旧 .ticker）。
 * CSSアニメーションでループするため、項目リストを2回連結して継ぎ目を隠す。
 */
export function Ticker({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {loop.map((item, i) => (
          <span key={i}>
            <span className="ticker__item">{item}</span>
            <span className="ticker__sep">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
