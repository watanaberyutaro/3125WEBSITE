"use client";

import { retryPublishJob } from "@/lib/admin/drafts-actions";

export function RetryPublishButton({
  draftId,
  draftVersionId,
  targetPath,
}: {
  draftId: string;
  draftVersionId: string;
  targetPath: string;
}) {
  return (
    <form action={retryPublishJob}>
      <input type="hidden" name="draftId" value={draftId} />
      <input type="hidden" name="draftVersionId" value={draftVersionId} />
      <input type="hidden" name="targetPath" value={targetPath} />
      <button
        type="submit"
        className="border border-line px-4 py-2 font-mono text-[11px] tracking-[0.06em] text-text-2 uppercase transition-colors hover:border-green hover:text-green"
      >
        再試行する
      </button>
    </form>
  );
}
