"use client";

import { runGenerateFromComments } from "@/lib/admin/jobs-actions";

export function RegenerateFromCommentsButton({ draftId }: { draftId: string }) {
  return (
    <form action={runGenerateFromComments}>
      <input type="hidden" name="draftId" value={draftId} />
      <button
        type="submit"
        className="border border-line px-4 py-2 font-mono text-[11px] tracking-[0.06em] text-text-2 uppercase transition-colors hover:border-green hover:text-green"
      >
        コメントを踏まえて自動で再生成する
      </button>
    </form>
  );
}
