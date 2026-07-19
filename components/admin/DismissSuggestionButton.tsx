"use client";

import { dismissSuggestion } from "@/lib/admin/suggestions-actions";

export function DismissSuggestionButton({ suggestionId }: { suggestionId: string }) {
  return (
    <form action={dismissSuggestion}>
      <input type="hidden" name="suggestionId" value={suggestionId} />
      <button
        type="submit"
        className="border border-line px-3 py-1.5 font-mono text-[10px] tracking-[0.06em] text-text-3 uppercase transition-colors hover:text-[#b3432b]"
      >
        却下する
      </button>
    </form>
  );
}
