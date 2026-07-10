import { Resend } from "resend";

let client: Resend | null = null;

/** RESEND_API_KEY未設定時にモジュール読み込み自体が失敗しないよう遅延初期化する。 */
export function getResendClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY が未設定です。");
    client = new Resend(apiKey);
  }
  return client;
}
