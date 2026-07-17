type Comment = {
  id: string;
  comment_type: string;
  body: string;
  created_at: string;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
};

const COMMENT_TYPE_LABEL: Record<string, string> = {
  revision: "修正依頼",
  rejection: "却下",
  approval_note: "承認メモ",
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function resolveDisplayName(profiles: Comment["profiles"]): string {
  const profile = Array.isArray(profiles) ? profiles[0] : profiles;
  return profile?.display_name ?? "不明なユーザー";
}

/** 承認/修正依頼/却下コメントの履歴を新しい順に表示する。誰が・いつ・何を判断したかを一覧化する。 */
export function DraftCommentHistory({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return <p className="text-[13px] text-text-3">コメントはまだありません。</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((c) => (
        <div key={c.id} className="border border-line p-4">
          <div className="mb-2 flex flex-wrap items-center gap-3 font-mono text-[11px] text-text-3">
            <span className="uppercase" style={{ color: c.comment_type === "rejection" ? "#b3432b" : c.comment_type === "revision" ? "#b3822b" : "var(--green)" }}>
              {COMMENT_TYPE_LABEL[c.comment_type] ?? c.comment_type}
            </span>
            <span>{resolveDisplayName(c.profiles)}</span>
            <span>{formatDateTime(c.created_at)}</span>
          </div>
          <p className="whitespace-pre-wrap text-[13px] text-text-2">{c.body}</p>
        </div>
      ))}
    </div>
  );
}
