"use client";

import { dismissTopicIdea } from "@/lib/admin/topic-ideas-actions";

export function DismissTopicIdeaButton({ ideaId }: { ideaId: string }) {
  return (
    <form action={dismissTopicIdea}>
      <input type="hidden" name="ideaId" value={ideaId} />
      <button
        type="submit"
        className="border border-line px-4 py-2 font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase transition-colors hover:text-[#b3432b]"
      >
        却下する
      </button>
    </form>
  );
}
