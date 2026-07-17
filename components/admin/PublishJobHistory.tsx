import { formatDateTime } from "@/lib/admin/format";

type PublishJob = {
  id: string;
  target_path: string;
  status: string;
  commit_sha: string | null;
  commit_url: string | null;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "待機中", color: "var(--text-3)" },
  processing: { label: "処理中", color: "#b3822b" },
  succeeded: { label: "成功", color: "var(--green)" },
  failed: { label: "失敗", color: "#b3432b" },
};

/**
 * 承認後にpublish_jobsへ積まれた公開ジョブの履歴。
 * Supabase側のpg_netトリガーが非同期で処理するため、ここでの表示は
 * ページ再読み込み（revalidatePathでは自動更新されない、pg_netの実行は
 * Server Actionのレスポンスより後になるため）が必要になる場合がある。
 */
export function PublishJobHistory({ jobs }: { jobs: PublishJob[] }) {
  if (jobs.length === 0) {
    return <p className="text-[13px] text-text-3">公開ジョブはまだありません。</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {jobs.map((job) => {
        const config = STATUS_CONFIG[job.status] ?? { label: job.status, color: "var(--text-3)" };
        return (
          <div key={job.id} className="border border-line p-4">
            <div className="mb-2 flex flex-wrap items-center gap-3 font-mono text-[11px] text-text-3">
              <span className="inline-flex items-center gap-1.5 uppercase" style={{ color: config.color }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: config.color }} />
                {config.label}
              </span>
              <span>{job.target_path}</span>
              <span>{formatDateTime(job.created_at)}</span>
            </div>
            {job.commit_url && (
              <a href={job.commit_url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-green hover:underline">
                コミットを見る {job.commit_sha?.slice(0, 7)}
              </a>
            )}
            {job.error_message && <p className="text-[13px] text-[#b3432b]">{job.error_message}</p>}
          </div>
        );
      })}
    </div>
  );
}
