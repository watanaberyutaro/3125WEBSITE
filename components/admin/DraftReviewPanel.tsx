"use client";

import { useActionState, useState } from "react";
import { reviewDraft } from "@/lib/admin/drafts-actions";

type Decision = "approve" | "revise" | "reject";

const DECISION_CONFIG: Record<Decision, { label: string; needsComment: boolean; style: "green" | "amber" | "red" }> = {
  approve: { label: "承認する", needsComment: false, style: "green" },
  revise: { label: "修正依頼する", needsComment: true, style: "amber" },
  reject: { label: "却下する", needsComment: true, style: "red" },
};

/** トグルボタン用：選択中のみ塗り色、非選択は控えめな枠線。 */
const TOGGLE_ACTIVE_STYLES: Record<"green" | "amber" | "red", string> = {
  green: "border border-green bg-green-4 text-green",
  amber: "border border-[#b3822b] bg-[#f5ead9] text-[#b3822b]",
  red: "border border-[#b3432b] bg-[#f3e3df] text-[#b3432b]",
};

/** 送信ボタン用：選んだ決定に関わらず常に塗りつぶしで目立たせる。 */
const SUBMIT_STYLES: Record<"green" | "amber" | "red", string> = {
  green: "bg-green text-white hover:opacity-90",
  amber: "bg-[#b3822b] text-white hover:opacity-90",
  red: "bg-[#b3432b] text-white hover:opacity-90",
};

/**
 * 承認/修正依頼/却下の3ボタン + コメント欄。
 * 却下・修正依頼はコメント必須（サーバー側でも再検証される）なので、
 * 選択したボタンに応じてコメント欄の必須表示を切り替える。
 */
export function DraftReviewPanel({
  draftId,
  latestVersionId,
  disabled,
}: {
  draftId: string;
  latestVersionId: string;
  disabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(reviewDraft, undefined);
  const [decision, setDecision] = useState<Decision>("approve");
  const needsComment = DECISION_CONFIG[decision].needsComment;

  if (disabled) {
    return <p className="text-[13px] text-text-3">このステータスではレビュー操作はできません。</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="draftId" value={draftId} />
      <input type="hidden" name="draftVersionId" value={latestVersionId} />
      <input type="hidden" name="decision" value={decision} />

      <div className="flex gap-2">
        {(Object.keys(DECISION_CONFIG) as Decision[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setDecision(key)}
            className={`px-4 py-2 font-mono text-[11px] tracking-[0.06em] uppercase transition-colors ${
              decision === key ? TOGGLE_ACTIVE_STYLES[DECISION_CONFIG[key].style] : "border border-line text-text-3"
            }`}
          >
            {DECISION_CONFIG[key].label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[11px] tracking-[0.06em] text-text-3 uppercase" htmlFor="comment">
          コメント{needsComment && " *"}
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          required={needsComment}
          placeholder={
            needsComment
              ? "修正・却下の理由を具体的に記入してください（次回の生成・レビューに反映されます）"
              : "任意コメント"
          }
          className="border border-line bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-green"
        />
      </div>

      {state?.error && (
        <p className="text-[13px] text-[#b3432b]" role="alert">
          {state.error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className={`px-6 py-3 font-mono text-[12px] tracking-[0.08em] uppercase transition-opacity disabled:opacity-50 ${SUBMIT_STYLES[DECISION_CONFIG[decision].style]}`}
        >
          {pending ? "処理中…" : DECISION_CONFIG[decision].label}
        </button>
      </div>
    </form>
  );
}
