import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";

async function getCounts() {
  const supabase = await createClient();

  const [works, worksDraft, articles, articlesDraft, inquiries, toolLeads] = await Promise.all([
    supabase.from("works").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("works").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("tool_leads").select("id", { count: "exact", head: true }),
  ]);

  return {
    worksPublished: works.count ?? 0,
    worksDraft: worksDraft.count ?? 0,
    articlesPublished: articles.count ?? 0,
    articlesDraft: articlesDraft.count ?? 0,
    newInquiries: inquiries.count ?? 0,
    toolLeads: toolLeads.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const staff = await requireStaff();
  const counts = await getCounts();

  const cards = [
    { label: "公開中の実績", value: counts.worksPublished, sub: `下書き ${counts.worksDraft}件`, href: "/admin/works" },
    { label: "公開中の記事", value: counts.articlesPublished, sub: `下書き ${counts.articlesDraft}件`, href: "/admin/articles" },
    { label: "未対応の問い合わせ", value: counts.newInquiries, sub: "status = new", href: "/admin/inquiries" },
    { label: "AIツール利用ログ", value: counts.toolLeads, sub: "累計", href: "/admin/tool-leads" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">ダッシュボード</h1>
        <p className="mt-1 text-[13px] text-text-2">ようこそ、{staff.displayName ?? staff.email} さん。</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="flex flex-col gap-2 border border-line p-5 transition-colors hover:border-green"
          >
            <span className="font-mono text-[10px] tracking-[0.08em] text-text-3 uppercase">{c.label}</span>
            <span className="font-display text-3xl font-bold text-text">{c.value}</span>
            <span className="text-[12px] text-text-3">{c.sub}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
