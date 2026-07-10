"use client";

import { useTransition } from "react";
import { updateInquiryStatus } from "@/lib/admin/inquiries-actions";

const STATUS_LABELS: Record<string, string> = {
  new: "未対応",
  in_progress: "対応中",
  done: "完了",
};

export function InquiryStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as "new" | "in_progress" | "done";
        startTransition(() => updateInquiryStatus(id, next));
      }}
      className="border border-line bg-bg px-2 py-1 text-[12px] outline-none focus:border-green disabled:opacity-50"
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
