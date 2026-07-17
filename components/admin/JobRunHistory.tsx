import { formatDateTime } from "@/lib/admin/format";

type JobRun = {
  id: string;
  kind: string;
  status: string;
  output: unknown;
  error_message: string | null;
  created_at: string;
};

const KIND_LABEL: Record<string, string> = {
  research: "調査",
  generate: "生成",
  review: "レビュー",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "待機中", color: "var(--text-3)" },
  processing: { label: "処理中", color: "#b3822b" },
  succeeded: { label: "成功", color: "var(--green)" },
  failed: { label: "失敗", color: "#b3432b" },
};

function isReviewOutput(output: unknown): output is { passed: boolean; issues: string[] } {
  return typeof output === "object" && output !== null && "issues" in output && Array.isArray((output as { issues: unknown }).issues);
}

/**
 * research/generate/reviewのjob_runs履歴。Phase4時点では全て同期処理のため、
 * PublishJobHistoryと異なり自動リフレッシュコンポーネントは不要
 * （redirect後のページロードで既に最終状態が反映されているため）。
 */
export function JobRunHistory({ jobRuns }: { jobRuns: JobRun[] }) {
  if (jobRuns.length === 0) {
    return <p className="text-[13px] text-text-3">エージェント実行履歴はまだありません。</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {jobRuns.map((job) => {
        const config = STATUS_CONFIG[job.status] ?? { label: job.status, color: "var(--text-3)" };
        return (
          <div key={job.id} className="border border-line p-4">
            <div className="mb-2 flex flex-wrap items-center gap-3 font-mono text-[11px] text-text-3">
              <span className="uppercase">{KIND_LABEL[job.kind] ?? job.kind}</span>
              <span className="inline-flex items-center gap-1.5 uppercase" style={{ color: config.color }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: config.color }} />
                {config.label}
              </span>
              <span>{formatDateTime(job.created_at)}</span>
            </div>
            {job.kind === "review" && isReviewOutput(job.output) && (
              <div className="text-[13px]">
                {job.output.passed ? (
                  <p className="text-green">問題は見つかりませんでした</p>
                ) : (
                  <ul className="list-disc pl-5 text-[#b3432b]">
                    {job.output.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {job.error_message && <p className="text-[13px] text-[#b3432b]">{job.error_message}</p>}
          </div>
        );
      })}
    </div>
  );
}
