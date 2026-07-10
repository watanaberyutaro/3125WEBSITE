"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth/actions";
import type { StaffProfile } from "@/lib/auth/session";

const NAV_ITEMS = [
  { href: "/admin", label: "ダッシュボード", exact: true as boolean },
  { href: "/admin/works", label: "制作実績", exact: false as boolean },
  { href: "/admin/articles", label: "記事", exact: false as boolean },
  { href: "/admin/categories", label: "カテゴリ", exact: false as boolean },
  { href: "/admin/inquiries", label: "お問い合わせ", exact: false as boolean },
  { href: "/admin/tool-leads", label: "AIツール利用ログ", exact: false as boolean },
] as const;

export function AdminSidebar({ staff }: { staff: StaffProfile }) {
  const pathname = usePathname();

  return (
    <aside
      className="flex w-60 shrink-0 flex-col justify-between border-r border-line px-5 py-6"
      style={{ background: "var(--bg-2)" }}
    >
      <div className="flex flex-col gap-8">
        <Link href="/admin" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-text">3125</span>
          <span className="font-mono text-[10px] tracking-[0.1em] text-text-3 uppercase">Admin</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-[13px] transition-colors"
                style={{
                  color: active ? "var(--green)" : "var(--text-2)",
                  background: active ? "var(--green-4)" : "transparent",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] text-text">{staff.displayName ?? staff.email}</p>
          <p className="font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">{staff.role}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full border border-line px-3 py-2 text-left text-[12px] text-text-2 transition-colors hover:border-green hover:text-green"
          >
            ログアウト
          </button>
        </form>
      </div>
    </aside>
  );
}
