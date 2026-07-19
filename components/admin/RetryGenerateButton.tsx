"use client";

import { retryGenerateJob } from "@/lib/admin/jobs-actions";

export function RetryGenerateButton({
  draftId,
  topic,
  contentType,
}: {
  draftId: string;
  topic: string;
  contentType: string;
}) {
  return (
    <form action={retryGenerateJob}>
      <input type="hidden" name="draftId" value={draftId} />
      <input type="hidden" name="topic" value={topic} />
      <input type="hidden" name="contentType" value={contentType} />
      <button
        type="submit"
        className="border border-line px-4 py-2 font-mono text-[11px] tracking-[0.06em] text-text-2 uppercase transition-colors hover:border-green hover:text-green"
      >
        AI生成を再試行する
      </button>
    </form>
  );
}
