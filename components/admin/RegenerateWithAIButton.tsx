"use client";

import { runRegenerateWithAI } from "@/lib/admin/jobs-actions";

export function RegenerateWithAIButton({ draftId }: { draftId: string }) {
  return (
    <form action={runRegenerateWithAI}>
      <input type="hidden" name="draftId" value={draftId} />
      <button
        type="submit"
        className="border border-line px-4 py-2 font-mono text-[11px] tracking-[0.06em] text-text-2 uppercase transition-colors hover:border-green hover:text-green"
      >
        AIに指摘を踏まえて書き直させる
      </button>
    </form>
  );
}
