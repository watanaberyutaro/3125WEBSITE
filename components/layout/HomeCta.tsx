import { siteConfig } from "@/lib/site-config";

type Bg = "dark" | "dark2" | "dark3";

/* 紙面版の赤ラベルは和文で（各ページから渡される英字の見出しを置き換える） */
const EYEBROW_JA: Record<string, string> = {
  "Let's Work Together": "ご相談、受け付けています。",
  "Get Started": "まずは、ご相談から。",
  "Contact Us": "お問い合わせ受付中",
  "Next Project": "次の案件を、ご一緒に。",
};

/**
 * ページ末尾の共通CTA（紙面版: 紙面に刷られた全面広告）。
 * 左にインクの挿絵、右に見出し・リード・きりとり線つきの申込券と連絡先。
 * props は従来の HomeCta と同じ（bg は紙面版では使わないが互換のため残す）。
 */
export function HomeCta({
  eyebrow,
  title,
  sub,
  primary,
  secondary,
}: {
  bg?: Bg;
  eyebrow: string;
  title: string;
  sub: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  const label = EYEBROW_JA[eyebrow] ?? eyebrow;
  /* 読点の後で改行（「AIの力で、／ビジネスを変えませんか。」） */
  const lines = title.split(/(?<=、)/);
  return (
    <section className="ad-page" aria-labelledby="cta-heading">
      <div className="ad-page__frame">
        <header className="ad-page__bar">
          <span className="ad-page__tag">広告</span>
          <span className="ad-page__sponsor">
            {siteConfig.name}
          </span>
        </header>
        <div className="ad-page__body">
          <figure className="ad-page__art" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/cta-board.jpg" alt="" loading="lazy" decoding="async" />
          </figure>
          <div className="ad-page__copy">
            <p className="ad-page__eyebrow">{label}</p>
            <h2 className="ad-page__title reveal" id="cta-heading">
              {lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h2>
            <p className="ad-page__sub reveal d1">{sub}</p>
            <div className="ad-page__coupon">
              <span className="ad-page__scissors" aria-hidden="true">
                ✂ ── きりとり線 ──
              </span>
              <a className="ad-page__ticket" href={primary.href}>
                <span className="ad-page__ticket-k">申込券</span>
                <span className="ad-page__ticket-t">{primary.label}</span>
                <span className="ad-page__ticket-a" aria-hidden="true">
                  →
                </span>
              </a>
              <div className="ad-page__contacts">
                <a href={siteConfig.phoneHref}>
                  <small>お電話</small>
                  {siteConfig.phone}
                </a>
                <a href={`mailto:${siteConfig.email}`}>
                  <small>メール</small>
                  {siteConfig.email}
                </a>
              </div>
              {secondary && (
                <a className="ad-page__more" href={secondary.href}>
                  {secondary.label} →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
