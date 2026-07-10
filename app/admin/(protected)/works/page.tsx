import Link from "next/link";
import { getAdminWorks } from "@/lib/admin/queries";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DeleteWorkButton } from "@/components/admin/DeleteWorkButton";

export default async function AdminWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const works = await getAdminWorks();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">制作実績</h1>
        <Link
          href="/admin/works/new"
          className="bg-green px-4 py-2 font-mono text-[12px] tracking-[0.06em] text-white uppercase"
        >
          + 新規追加
        </Link>
      </div>

      {saved && <p className="border border-green bg-green-4 px-4 py-2 text-[13px] text-green">保存しました。</p>}

      <div className="overflow-x-auto border border-line">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line" style={{ background: "var(--bg-2)" }}>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">順</th>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">クライアント / 案件</th>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">年</th>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">状態</th>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {works.map((w) => (
              <tr key={w.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-text-3">{w.sort_order}</td>
                <td className="px-4 py-3 text-text">
                  {w.client_name}
                  <span className="text-text-3"> / {w.project_name}</span>
                </td>
                <td className="px-4 py-3 text-text-2">{w.year}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={w.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/works/${w.id}/edit`} className="text-green hover:underline">
                      編集
                    </Link>
                    <DeleteWorkButton id={w.id} label={`${w.client_name} ${w.project_name}`} />
                  </div>
                </td>
              </tr>
            ))}
            {works.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-3">
                  制作実績がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
