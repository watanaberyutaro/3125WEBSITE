export function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "published";
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.06em] uppercase"
      style={{ color: isPublished ? "var(--green)" : "var(--text-3)" }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: isPublished ? "var(--green)" : "var(--text-4)" }}
      />
      {isPublished ? "published" : "draft"}
    </span>
  );
}
