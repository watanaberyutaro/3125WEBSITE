import Link from "next/link";
import { getAdminArticles } from "@/lib/admin/queries";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const articles = await getAdminArticles();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">記事</h1>
        <Link
          href="/admin/articles/new"
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
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">タイトル</th>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">公開日</th>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">状態</th>
              <th className="px-4 py-3 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-text">{a.title}</td>
                <td className="px-4 py-3 text-text-2">{formatDate(a.published_at)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/articles/${a.id}/edit`} className="text-green hover:underline">
                      編集
                    </Link>
                    <DeleteArticleButton id={a.id} label={a.title} />
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-3">
                  記事がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
