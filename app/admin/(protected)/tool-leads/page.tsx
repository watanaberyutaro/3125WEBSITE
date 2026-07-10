import { getAdminToolLeads } from "@/lib/admin/queries";
import { getToolBySlug } from "@/lib/tools/registry";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function AdminToolLeadsPage() {
  const leads = await getAdminToolLeads();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">AIツール利用ログ</h1>
        <p className="mt-1 text-[13px] text-text-2">
          「/tools」で公開しているAIツール群の利用履歴です。全ツール共通の1テーブルで記録されるため、
          今後ツールが増えてもこの画面の実装は変わりません。
        </p>
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line" style={{ background: "var(--bg-2)" }}>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">ツール</th>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">メール</th>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">日時</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-text">
                  {getToolBySlug(l.tool_slug)?.name ?? l.tool_slug}
                  <span className="ml-2 font-mono text-[10px] text-text-3">{l.tool_slug}</span>
                </td>
                <td className="px-4 py-3 text-text-2">{l.email ?? "—"}</td>
                <td className="px-4 py-3 text-text-3">{formatDateTime(l.created_at)}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-text-3">
                  まだ利用ログがありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
