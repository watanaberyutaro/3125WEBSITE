"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/** キーワード検索フォーム（Works/Columnで共用）。旧サイトには無かった新規機能。 */
export function SearchForm({
  basePath,
  defaultValue = "",
  placeholder,
  label,
}: {
  basePath: string;
  defaultValue?: string;
  placeholder: string;
  label: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label={label}
      className="mx-auto mb-8 flex max-w-[var(--max-w)] items-center gap-2"
    >
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="form-input"
        style={{ maxWidth: 320 }}
        aria-label="キーワード"
      />
      <button type="submit" className="filter-btn" style={{ borderBottom: "none" }} aria-label="検索する">
        検索
      </button>
    </form>
  );
}
