import Link from "next/link";
import { formatDateTime } from "@/lib/admin/format";
import { GenerateSuggestionButton } from "./GenerateSuggestionButton";
import { SendSuggestionAsRevisionButton } from "./SendSuggestionAsRevisionButton";
import { DismissSuggestionButton } from "./DismissSuggestionButton";

type Draft = {
  id: string;
  content_type: string;
  title: string;
  status: string;
  target_path: string | null;
  updated_at: string;
};

type Suggestion = {
  id: string;
  issues: unknown;
  suggestion_text: string | null;
  status: string;
  created_at: string;
};

const CONTENT_TYPE_LABEL: Record<string, string> = {
  article: "記事",
  service_page: "サービスページ",
};

const SUGGESTION_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  open: { label: "未対応", color: "#b3822b" },
  actioned: { label: "対応済み（修正依頼中）", color: "var(--green)" },
  dismissed: { label: "却下済み", color: "var(--text-3)" },
};

function issuesToArray(issues: unknown): string[] {
  return Array.isArray(issues) ? issues.filter((i): i is string => typeof i === "string") : [];
}

export function ImprovementSuggestionList({ items }: { items: { draft: Draft; latestSuggestion: Suggestion | null }[] }) {
  if (items.length === 0) {
    return <p className="text-[13px] text-text-3">対象となる公開済みコンテンツがありません。</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map(({ draft, latestSuggestion }) => {
        const issues = latestSuggestion ? issuesToArray(latestSuggestion.issues) : [];
        const statusConfig = latestSuggestion ? SUGGESTION_STATUS_LABEL[latestSuggestion.status] : null;
        return (
          <div key={draft.id} className="border border-line p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-text-3">
                <span className="uppercase">{CONTENT_TYPE_LABEL[draft.content_type] ?? draft.content_type}</span>
                <Link href={`/admin/drafts/${draft.id}`} className="text-text hover:text-green hover:underline">
                  {draft.title}
                </Link>
                <span>{formatDateTime(draft.updated_at)}</span>
                {draft.status === "needs_revision" && <span className="text-[#b3822b] uppercase">修正依頼中</span>}
              </div>
              <GenerateSuggestionButton draftId={draft.id} hasExisting={!!latestSuggestion} />
            </div>

            {latestSuggestion && (
              <div className="flex flex-col gap-2 border-t border-line pt-3">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase" style={{ color: statusConfig?.color }}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: statusConfig?.color }} />
                  {statusConfig?.label ?? latestSuggestion.status}
                </div>
                {issues.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">機械的チェック</p>
                    <ul className="list-disc pl-5 text-[13px] text-[#b3432b]">
                      {issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {latestSuggestion.suggestion_text && (
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase">AIによる提案</p>
                    <p className="whitespace-pre-wrap text-[13px] text-text-2">{latestSuggestion.suggestion_text}</p>
                  </div>
                )}
                {latestSuggestion.status === "open" && draft.status === "published" && (
                  <div className="flex gap-3 pt-1">
                    <SendSuggestionAsRevisionButton suggestionId={latestSuggestion.id} />
                    <DismissSuggestionButton suggestionId={latestSuggestion.id} />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
