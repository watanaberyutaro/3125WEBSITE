import { notFound } from "next/navigation";
import { getAdminDraftWithHistory } from "@/lib/admin/queries";
import { addDraftVersion } from "@/lib/admin/drafts-actions";
import { DraftStatusBadge } from "@/components/admin/DraftStatusBadge";
import { DraftVersionHistory } from "@/components/admin/DraftVersionHistory";
import { DraftReviewPanel } from "@/components/admin/DraftReviewPanel";
import { DraftCommentHistory } from "@/components/admin/DraftCommentHistory";
import { DraftForm } from "@/components/admin/DraftForm";
import { PublishJobHistory } from "@/components/admin/PublishJobHistory";
import { PublishJobAutoRefresh } from "@/components/admin/PublishJobAutoRefresh";
import { RetryPublishButton } from "@/components/admin/RetryPublishButton";
import { JobRunHistory } from "@/components/admin/JobRunHistory";
import { RegenerateFromCommentsButton } from "@/components/admin/RegenerateFromCommentsButton";
import { RunReviewCheckButton } from "@/components/admin/RunReviewCheckButton";

const CONTENT_TYPE_LABEL: Record<string, string> = {
  article: "記事",
  service_page: "サービスページ",
  cta_copy: "CTA文言",
  faq: "FAQ",
  landing_page: "LP",
  other: "その他",
};

function formatReviewJobRunSummary(job: { output: unknown }): string {
  const output = job.output;
  if (typeof output !== "object" || output === null || !("passed" in output) || !("issues" in output)) return "-";
  const { passed, issues } = output as { passed: boolean; issues: unknown[] };
  return passed ? "問題なし" : `${issues.length}件の指摘あり`;
}

export default async function DraftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getAdminDraftWithHistory(id);
  if (!result) notFound();

  const { draft, versions, comments, publishJobs, jobRuns } = result;
  const latestVersion = versions[0];
  const hasPendingJob = publishJobs.some((j) => j.status === "pending" || j.status === "processing");
  const latestFailedJob = publishJobs.find((j) => j.status === "failed");
  const latestReviewJobRun = jobRuns.find((j) => j.kind === "review");

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PublishJobAutoRefresh hasPendingJob={hasPendingJob} />

      <div>
        <p className="mb-1 font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase">
          {CONTENT_TYPE_LABEL[draft.content_type] ?? draft.content_type}
          {draft.target_path && ` · ${draft.target_path}`}
        </p>
        <h1 className="font-display text-2xl font-bold text-text">{draft.title}</h1>
        <div className="mt-2">
          <DraftStatusBadge status={draft.status} />
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-[12px] tracking-[0.06em] text-text-3 uppercase">バージョン履歴</h2>
        <DraftVersionHistory versions={versions} />
      </section>

      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <h2 className="font-mono text-[12px] tracking-[0.06em] text-text-3 uppercase">
          エージェント実行履歴（調査・生成・レビュー）
        </h2>
        <JobRunHistory jobRuns={jobRuns} />
      </section>

      {draft.status === "needs_revision" && latestVersion && (
        <section className="flex flex-col gap-4 border-t border-line pt-6">
          <h2 className="font-mono text-[12px] tracking-[0.06em] text-text-3 uppercase">
            修正依頼への対応（新バージョンを追加）
          </h2>
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-text-3">ルールベースで、過去の修正・却下コメントをチェックリスト化して引き継いだ新バージョンを自動生成できます。</p>
            <RegenerateFromCommentsButton draftId={draft.id} />
          </div>
          <p className="font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase">または手動で修正する</p>
          <DraftForm
            action={addDraftVersion}
            defaults={{
              draftId: draft.id,
              title: latestVersion.title,
              body_markdown: latestVersion.body_markdown,
              seo_title: latestVersion.seo_title ?? "",
              seo_description: latestVersion.seo_description ?? "",
              cta_label: latestVersion.cta_label ?? "",
              cta_href: latestVersion.cta_href ?? "",
            }}
            submitLabel="新バージョンとして保存し再レビュー依頼"
            isNewDraft={false}
          />
        </section>
      )}

      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <h2 className="font-mono text-[12px] tracking-[0.06em] text-text-3 uppercase">レビュー</h2>
        {draft.status === "draft" && latestVersion && (
          <div className="flex flex-col gap-2">
            <RunReviewCheckButton draftId={draft.id} draftVersionId={latestVersion.id} />
            {latestReviewJobRun && (
              <p className="text-[13px] text-text-3">
                直近の自動チェック: {formatReviewJobRunSummary(latestReviewJobRun)}
              </p>
            )}
          </div>
        )}
        {latestVersion && (
          <DraftReviewPanel
            draftId={draft.id}
            latestVersionId={latestVersion.id}
            disabled={draft.status !== "draft"}
          />
        )}
      </section>

      {draft.content_type !== "article" && (
        <section className="flex flex-col gap-4 border-t border-line pt-6">
          <h2 className="font-mono text-[12px] tracking-[0.06em] text-text-3 uppercase">
            公開ジョブ（Git push履歴）
          </h2>
          <PublishJobHistory jobs={publishJobs} />
          {latestFailedJob && latestVersion && draft.target_path && (
            <RetryPublishButton draftId={draft.id} draftVersionId={latestVersion.id} targetPath={draft.target_path} />
          )}
        </section>
      )}

      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <h2 className="font-mono text-[12px] tracking-[0.06em] text-text-3 uppercase">コメント履歴</h2>
        <DraftCommentHistory comments={comments} />
      </section>
    </div>
  );
}
