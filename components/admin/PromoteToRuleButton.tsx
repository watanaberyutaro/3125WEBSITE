"use client";

import { promoteReviewCommentToRule } from "@/lib/admin/rejection-rules-actions";

export function PromoteToRuleButton({ reviewCommentId }: { reviewCommentId: string }) {
  return (
    <form action={promoteReviewCommentToRule}>
      <input type="hidden" name="reviewCommentId" value={reviewCommentId} />
      <button
        type="submit"
        className="border border-line px-3 py-1.5 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase transition-colors hover:border-green hover:text-green"
      >
        この指摘をルール化する
      </button>
    </form>
  );
}
