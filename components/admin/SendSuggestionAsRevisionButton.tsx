"use client";

import { sendSuggestionAsRevision } from "@/lib/admin/suggestions-actions";

export function SendSuggestionAsRevisionButton({ suggestionId }: { suggestionId: string }) {
  return (
    <form action={sendSuggestionAsRevision}>
      <input type="hidden" name="suggestionId" value={suggestionId} />
      <button
        type="submit"
        className="border border-green px-3 py-1.5 font-mono text-[10px] tracking-[0.06em] text-green uppercase transition-colors hover:bg-green-4"
      >
        修正依頼として送る
      </button>
    </form>
  );
}
