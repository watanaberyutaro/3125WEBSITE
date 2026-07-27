"use client";

import { useFormStatus } from "react-dom";
import { generateTopicIdeas } from "@/lib/admin/topic-ideas-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-green px-5 py-2.5 font-mono text-[12px] tracking-[0.08em] text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "生成中…" : "記事ネタを生成する"}
    </button>
  );
}

export function GenerateTopicIdeasButton() {
  return (
    <form action={generateTopicIdeas}>
      <SubmitButton />
    </form>
  );
}
