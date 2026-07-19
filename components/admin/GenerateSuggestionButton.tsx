"use client";

import { generateSuggestion } from "@/lib/admin/suggestions-actions";

export function GenerateSuggestionButton({ draftId, hasExisting }: { draftId: string; hasExisting: boolean }) {
  return (
    <form action={generateSuggestion}>
      <input type="hidden" name="draftId" value={draftId} />
      <button
        type="submit"
        className="border border-line px-3 py-1.5 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase transition-colors hover:border-green hover:text-green"
      >
        {hasExisting ? "改善提案を再生成する" : "改善提案を生成する"}
      </button>
    </form>
  );
}
