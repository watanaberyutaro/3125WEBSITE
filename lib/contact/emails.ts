import { siteConfig } from "@/lib/site-config";
import { BUDGET_LABELS, INQUIRY_LABELS } from "./constants";

export type ContactSubmission = {
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiry: string;
  budget: string;
  message: string;
};

function formatDateTime(): string {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Asia/Tokyo",
  }).format(new Date());
}

/** 管理者宛通知メール本文。旧 send.php のテンプレートを踏襲。 */
export function buildAdminEmail(s: ContactSubmission) {
  const inquiryLabel = INQUIRY_LABELS[s.inquiry] ?? s.inquiry;
  const budgetLabel = s.budget ? (BUDGET_LABELS[s.budget] ?? s.budget) : "未記入";

  const text = `お問い合わせウェブサイトフォームより届きました。

■ お名前　　　　　: ${s.name}
■ 会社名　　　　　: ${s.company || "未記入"}
■ メール　　　　　: ${s.email}
■ 電話番号　　　　: ${s.phone || "未記入"}
■ お問い合わせ内容: ${inquiryLabel}
■ ご予算　　　　　: ${budgetLabel}

■ メッセージ:
─────────────────────────────
${s.message}
─────────────────────────────

送信日時: ${formatDateTime()}`;

  return {
    subject: `【3125.jp】お問い合わせが届きました`,
    text,
  };
}

/** 送信者への自動返信メール本文。旧 send.php のテンプレートを踏襲。 */
export function buildReplyEmail(s: ContactSubmission) {
  const inquiryLabel = INQUIRY_LABELS[s.inquiry] ?? s.inquiry;

  const text = `${s.name} 様

この度はお問い合わせいただきありがとうございます。
${siteConfig.name}でございます。

内容を確認の上、通常2営業日以内にご返信いたします。
しばらくお待ちくださいますようお願い申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【お問い合わせ内容（確認用）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
お名前　　　　: ${s.name}
お問い合わせ  : ${inquiryLabel}

メッセージ:
${s.message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${siteConfig.name}
${siteConfig.address.full}
Tel: ${siteConfig.phone}
Email: ${siteConfig.email}`;

  return {
    subject: `【${siteConfig.name}】お問い合わせを受け付けました`,
    text,
  };
}
