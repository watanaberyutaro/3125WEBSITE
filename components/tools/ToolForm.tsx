"use client";

import { useState } from "react";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { ToolResult } from "./ToolResult";
import type { ToolField, ToolOutput } from "@/lib/tools/types";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * ツール定義のfieldsから汎用的にフォームを組み立てるコンポーネント。
 * 新しいツールを追加してもUI側の実装は不要（fieldsの型に沿って自動描画される）。
 */
export function ToolForm({ slug, fields }: { slug: string; fields: ToolField[] }) {
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState<ToolOutput | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch(`/api/tools/${slug}`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "生成に失敗しました");
      }

      setOutput(data.output);
      setStatus("success");
    } catch (err) {
      setError((err as Error).message);
      setStatus("error");
    }
  };

  return (
    <div className="tool-panel">
      <form className="contact-form" onSubmit={handleSubmit} aria-label="ツール入力フォーム">
        {fields.map((field) => (
          <div className="form-group" key={field.name}>
            <label className="form-label" htmlFor={field.name}>
              {field.label}
              {"required" in field && field.required && (
                <span className="req" aria-label="必須">
                  {" "}
                  *
                </span>
              )}
            </label>

            {field.type === "text" && (
              <input
                className="form-input"
                type="text"
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}

            {field.type === "textarea" && (
              <textarea
                className="form-textarea"
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}

            {field.type === "select" && (
              <select className="form-select" id={field.name} name={field.name} required={field.required} defaultValue="">
                <option value="" disabled>
                  ご選択ください
                </option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === "checkboxes" && (
              <div className="tool-checkboxes" role="group" aria-label={field.label}>
                {field.options.map((opt) => (
                  <label className="tool-checkbox" key={opt.value}>
                    <input type="checkbox" name={field.name} value={opt.value} />
                    {opt.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <button type="submit" className="btn btn--gold form-submit" disabled={status === "submitting"}>
          {status === "submitting" ? "生成中…" : "生成する"}
          {status !== "submitting" && <ArrowIcon />}
        </button>

        {status === "error" && (
          <p className="form-note tool-panel__error" role="alert">
            {error}
          </p>
        )}
      </form>

      {output && <ToolResult output={output} />}
    </div>
  );
}
