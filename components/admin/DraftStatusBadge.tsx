const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "下書き", color: "var(--text-3)" },
  needs_revision: { label: "修正依頼", color: "#b3822b" },
  rejected: { label: "却下", color: "#b3432b" },
  approved: { label: "承認済み", color: "var(--green)" },
  published: { label: "公開済み", color: "var(--green)" },
};

export function DraftStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: "var(--text-3)" };
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.06em] uppercase"
      style={{ color: config.color }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: config.color }} />
      {config.label}
    </span>
  );
}
