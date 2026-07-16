import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.tsに続く2段目のチェック(多層防御)。ここでprofilesの行が無ければログインへ戻す。
  const staff = await requireStaff();

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ background: "var(--bg)" }}>
      <AdminSidebar staff={staff} />
      <main className="flex-1 overflow-x-auto px-4 py-6 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
