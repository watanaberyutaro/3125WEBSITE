import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "管理者ログイン",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-8 px-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="flex flex-col items-center gap-1">
        <p className="font-display text-3xl font-bold text-text">3125</p>
        <p className="font-mono text-[11px] tracking-[0.16em] text-text-3 uppercase">Admin</p>
      </div>
      <LoginForm next={next ?? "/admin"} />
      <p className="font-mono text-[10px] text-text-4">{siteConfig.name}</p>
    </div>
  );
}
