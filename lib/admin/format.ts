/**
 * 管理画面の日時表示用フォーマッタ。
 * Date標準メソッド(getFullYear等)はローカルタイムゾーン依存のため、
 * クライアントコンポーネント内で使うとVercel(UTC)でのSSR結果とブラウザ(JST)
 * でのハイドレーション結果が食い違い、Reactのハイドレーションエラーになる
 * （実際に本番で発生を確認済み）。timeZoneを明示することでサーバー/クライアント
 * どちらで実行しても同じ文字列になるようにする。
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")} ${get("hour")}:${get("minute")}`;
}
