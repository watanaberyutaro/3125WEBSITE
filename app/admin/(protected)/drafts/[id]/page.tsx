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

const CONTENT_TYPE_LABEL: Record<string, string> = {
  article: "記事",
  service_page: "サービスページ",
  cta_copy: "CTA文言",
  faq: "FAQ",
  landing_page: "LP",
  other: "その他",
};

export default async function DraftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getAdminDraftWithHistory(id);
  if (!result) notFound();

  const { draft, versions, comments, publishJobs } = result;
  const latestVersion = versions[0];
  const hasPendingJob = publishJobs.some((j) => j.status === "pending" || j.status === "processing");
  const latestFailedJob = publishJobs.find((j) => j.status === "failed");

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

      {draft.status === "needs_revision" && latestVersion && (
        <section className="flex flex-col gap-4 border-t border-line pt-6">
          <h2 className="font-mono text-[12px] tracking-[0.06em] text-text-3 uppercase">
            修正依頼への対応（新バージョンを追加）
          </h2>
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
