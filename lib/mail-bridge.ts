/**
 * 既存のPHPホスティング上のメール送信エンドポイント(HP/api/send-mail.php)を
 * サーバー間通信で呼び出す。外部メール配信サービス(Resend等)は使わず、
 * このPHPホストのmb_send_mail()をそのまま使い続ける方針にしたための橋渡し。
 */
export type MailBridgePayload = {
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiry: string;
  budget: string;
  message: string;
};

export type MailBridgeResult = { ok: true } | { ok: false; error: string };

export async function sendContactMail(payload: MailBridgePayload): Promise<MailBridgeResult> {
  const url = process.env.MAIL_BRIDGE_URL;
  const secret = process.env.MAIL_BRIDGE_SECRET;

  if (!url || !secret) {
    console.warn("MAIL_BRIDGE_URL / MAIL_BRIDGE_SECRET が未設定のためメール送信をスキップします。");
    return { ok: false, error: "メール送信設定が未完了です。" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Mail-Secret": secret,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? `メール送信ブリッジがエラーを返しました (${res.status})` };
    }
    return { ok: true };
  } catch (err) {
    console.error("mail bridge fetch failed:", err);
    return { ok: false, error: "メール送信ブリッジへの接続に失敗しました。" };
  }
}
