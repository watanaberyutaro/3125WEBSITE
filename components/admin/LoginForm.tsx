"use client";

import { useActionState } from "react";
import { login } from "@/lib/auth/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-mono text-[11px] tracking-[0.08em] text-text-3 uppercase">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="border border-line bg-bg px-4 py-3 text-sm text-text outline-none focus:border-green"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-mono text-[11px] tracking-[0.08em] text-text-3 uppercase">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="border border-line bg-bg px-4 py-3 text-sm text-text outline-none focus:border-green"
        />
      </div>

      {state?.error && (
        <p className="text-[13px] text-[#b3432b]" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 bg-green px-6 py-3 font-mono text-[12px] tracking-[0.08em] text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  );
}
