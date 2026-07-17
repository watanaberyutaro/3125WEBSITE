"use client";

import { runReviewCheck } from "@/lib/admin/jobs-actions";

export function RunReviewCheckButton({ draftId, draftVersionId }: { draftId: string; draftVersionId: string }) {
  return (
    <form action={runReviewCheck}>
      <input type="hidden" name="draftId" value={draftId} />
      <input type="hidden" name="draftVersionId" value={draftVersionId} />
      <button
        type="submit"
        className="border border-line px-4 py-2 font-mono text-[11px] tracking-[0.06em] text-text-2 uppercase transition-colors hover:border-green hover:text-green"
      >
        自動チェックを実行
      </button>
    </form>
  );
}
