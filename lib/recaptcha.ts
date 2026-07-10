const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const SCORE_THRESHOLD = 0.5;

type SiteverifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

/**
 * reCAPTCHA v3トークンをGoogleへ照会し、スコアがしきい値以上かを判定する。
 * RECAPTCHA_SECRET_KEY未設定時は開発中でもフォームが完全に使えなくなるのを避けるため
 * 検証をスキップする（本番では必ず設定すること）。
 */
export async function verifyRecaptcha(token: string | null, expectedAction: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY未設定のためreCAPTCHA検証をスキップします。");
    return true;
  }
  if (!token) return false;

  const res = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  if (!res.ok) return false;
  const data: SiteverifyResponse = await res.json();

  return data.success && data.action === expectedAction && (data.score ?? 0) >= SCORE_THRESHOLD;
}
