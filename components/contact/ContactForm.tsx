"use client";

import { useState } from "react";
import Script from "next/script";
import { ArrowIcon } from "@/components/ui/ArrowIcon";

type Status = "idle" | "submitting" | "success" | "error";

const INQUIRY_OPTIONS = [
  { value: "education", label: "AIマンツーマン教育のご依頼" },
  { value: "implementation", label: "AI導入支援のご相談" },
  { value: "training", label: "AI研修・ワークショップのご依頼" },
  { value: "content", label: "AIコンテンツ制作のご依頼" },
  { value: "video", label: "映像制作のご依頼" },
  { value: "web", label: "Webサイト制作のご依頼" },
  { value: "other", label: "その他・ご質問" },
];

const BUDGET_OPTIONS = [
  { value: "under10", label: "〜10万円" },
  { value: "10to30", label: "10〜30万円" },
  { value: "30to100", label: "30〜100万円" },
  { value: "over100", label: "100万円以上" },
  { value: "unknown", label: "未定・要相談" },
];

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

async function getRecaptchaToken(): Promise<string> {
  if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) return "";
  return new Promise((resolve) => {
    window.grecaptcha!.ready(() => {
      window
        .grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action: "contact" })
        .then(resolve)
        .catch(() => resolve(""));
    });
  });
}

/**
 * お問い合わせフォーム。/api/contact へPOSTする。
 * 送信ロジックは旧 js/main.js の CONTACT FORM セクションを踏襲し、reCAPTCHA v3を追加。
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("submitting");

    try {
      const token = await getRecaptchaToken();
      const formData = new FormData(form);
      formData.set("recaptchaToken", token);

      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "送信に失敗しました");
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}
      <form className="contact-form" onSubmit={handleSubmit} aria-label="お問い合わせフォーム">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              お名前 <span className="req" aria-label="必須">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="name"
              name="name"
              placeholder="渡邊 隆太郎"
              autoComplete="name"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="company">
              会社名
            </label>
            <input
              className="form-input"
              type="text"
              id="company"
              name="company"
              placeholder="株式会社 ○○"
              autoComplete="organization"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              メールアドレス <span className="req" aria-label="必須">*</span>
            </label>
            <input
              className="form-input"
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              電話番号
            </label>
            <input
              className="form-input"
              type="tel"
              id="phone"
              name="phone"
              placeholder="090-0000-0000"
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="inquiry">
            お問い合わせ内容 <span className="req" aria-label="必須">*</span>
          </label>
          <select className="form-select" id="inquiry" name="inquiry" required defaultValue="">
            <option value="" disabled>
              ご選択ください
            </option>
            {INQUIRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="budget">
            ご予算
          </label>
          <select className="form-select" id="budget" name="budget" defaultValue="">
            <option value="" disabled>
              目安をお選びください（任意）
            </option>
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="message">
            メッセージ <span className="req" aria-label="必須">*</span>
          </label>
          <textarea
            className="form-textarea"
            id="message"
            name="message"
            placeholder="プロジェクトの概要・ご要望・ご質問などをお気軽にご記入ください。"
            required
          />
        </div>

        <p className="form-note">
          ご入力いただいた個人情報は、お問い合わせへの対応のみに使用し、第三者への提供は一切行いません。
          <br />
          通常2営業日以内にご返信いたします。このサイトはreCAPTCHAによって保護されています。
        </p>

        {status === "success" ? (
          <button type="button" className="btn btn--gold form-submit" style={{ opacity: 0.8 }} disabled>
            送信完了 — ありがとうございます ✓
          </button>
        ) : status === "error" ? (
          <button type="submit" className="btn btn--gold form-submit">
            送信に失敗しました — 直接メールでご連絡ください
          </button>
        ) : (
          <button type="submit" className="btn btn--gold form-submit" disabled={status === "submitting"}>
            {status === "submitting" ? "送信中…" : "送信する"}
            {status !== "submitting" && <ArrowIcon />}
          </button>
        )}
      </form>
    </>
  );
}
