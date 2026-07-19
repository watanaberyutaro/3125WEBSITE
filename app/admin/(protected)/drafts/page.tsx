import Link from "next/link";
import { getAdminDrafts, type DraftStatus } from "@/lib/admin/queries";
import { DraftStatusBadge } from "@/components/admin/DraftStatusBadge";
import { formatDateTime } from "@/lib/admin/format";

const STATUS_TABS: { value: DraftStatus | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "draft", label: "下書き" },
  { value: "needs_revision", label: "修正依頼" },
  { value: "approved", label: "承認済み" },
  { value: "published", label: "公開済み" },
  { value: "rejected", label: "却下" },
];

const CONTENT_TYPE_LABEL: Record<string, string> = {
  article: "記事",
  service_page: "サービスページ",
  cta_copy: "CTA文言",
  faq: "FAQ",
  landing_page: "LP",
  other: "その他",
};

export default async function AdminDraftsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; saved?: string; reviewed?: string }>;
}) {
  const { status, saved, reviewed } = await searchParams;
  const activeStatus = (status ?? "all") as DraftStatus | "all";
  const drafts = await getAdminDrafts(activeStatus === "all" ? undefined : activeStatus);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">下書き（承認ワークフロー）</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/drafts/generate"
            className="border border-green px-4 py-2 font-mono text-[12px] tracking-[0.06em] text-green uppercase"
          >
            AIで生成する
          </Link>
          <Link
            href="/admin/drafts/new"
            className="bg-green px-4 py-2 font-mono text-[12px] tracking-[0.06em] text-white uppercase"
          >
            + 新規下書き
          </Link>
        </div>
      </div>

      {saved && <p className="border border-green bg-green-4 px-4 py-2 text-[13px] text-green">保存しました。</p>}
      {reviewed && <p className="border border-green bg-green-4 px-4 py-2 text-[13px] text-green">レビュー結果を保存しました。</p>}

      <div className="flex flex-wrap gap-2 border-b border-line pb-4">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/drafts" : `/admin/drafts?status=${tab.value}`}
            className="px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] transition-colors"
            style={{
              border: `1px solid ${activeStatus === tab.value ? "var(--green)" : "var(--line)"}`,
              color: activeStatus === tab.value ? "var(--green)" : "var(--text-3)",
              background: activeStatus === tab.value ? "var(--green-4)" : "transparent",
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line" style={{ background: "var(--bg-2)" }}>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">種別</th>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">タイトル</th>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">状態</th>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">更新日時</th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((d) => (
              <tr key={d.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-mono text-[11px] text-text-3">
                  {CONTENT_TYPE_LABEL[d.content_type] ?? d.content_type}
                </td>
                <td className="px-4 py-3 text-text">
                  <Link href={`/admin/drafts/${d.id}`} className="hover:text-green hover:underline">
                    {d.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <DraftStatusBadge status={d.status} />
                </td>
                <td className="px-4 py-3 text-text-3">{formatDateTime(d.updated_at)}</td>
              </tr>
            ))}
            {drafts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-3">
                  該当する下書きがありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
