"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/lib/auth/actions";
import type { StaffProfile } from "@/lib/auth/session";

const NAV_ITEMS = [
  { href: "/admin", label: "ダッシュボード", exact: true as boolean },
  { href: "/admin/drafts", label: "下書き", exact: false as boolean },
  { href: "/admin/rejection-rules", label: "改善ルール", exact: false as boolean },
  { href: "/admin/improvement-suggestions", label: "改善提案", exact: false as boolean },
  { href: "/admin/works", label: "制作実績", exact: false as boolean },
  { href: "/admin/articles", label: "記事", exact: false as boolean },
  { href: "/admin/categories", label: "カテゴリ", exact: false as boolean },
  { href: "/admin/inquiries", label: "お問い合わせ", exact: false as boolean },
  { href: "/admin/tool-leads", label: "AIツール利用ログ", exact: false as boolean },
] as const;

/**
 * モバイル(md未満)では通常時オフキャンバス。ヘッダーのハンバーガーで開閉する
 * ドロワーに切り替える。md以上は従来通り常時表示の静的サイドバーに戻る。
 */
export function AdminSidebar({ staff }: { staff: StaffProfile }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4 md:hidden"
        style={{ background: "var(--bg-2)" }}
      >
        <Link href="/admin" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-text">3125</span>
          <span className="font-mono text-[10px] tracking-[0.1em] text-text-3 uppercase">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
          className="flex h-9 w-9 items-center justify-center border border-line text-text"
        >
          {open ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M1 4h14M1 8h14M1 12h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="admin-mobile-nav"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 -translate-x-full flex-col justify-between overflow-y-auto border-r border-line px-5 py-6 transition-transform duration-200 md:static md:z-auto md:w-60 md:translate-x-0 ${
          open ? "translate-x-0" : ""
        }`}
        style={{ background: "var(--bg-2)" }}
      >
        <div className="flex flex-col gap-8">
          <Link href="/admin" className="hidden items-baseline gap-2 md:flex">
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
    </>
  );
}
