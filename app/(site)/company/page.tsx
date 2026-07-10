import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { HomeCta } from "@/components/layout/HomeCta";
import { Ticker } from "@/components/layout/Ticker";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/lib/site-config";

const TITLE = "会社概要";
const DESCRIPTION =
  "3125株式会社の会社情報 — 東京都港区南青山に拠点を置くAIコンサルティング会社。AIマンツーマン教育・AI導入支援・AI研修を提供。会社概要・代表情報・所在地をご確認いただけます。";

export const metadata: Metadata = {
  title: `${TITLE}（東京・南青山）`,
  description: DESCRIPTION,
  alternates: { canonical: "/company" },
  openGraph: {
    title: `${TITLE} | ${siteConfig.name}（東京・南青山）`,
    description: DESCRIPTION,
    url: "/company",
    images: ["/assets/images/ogp.jpg"],
  },
};

const TICKER_ITEMS = [
  "AI Education",
  "AI導入支援",
  "AI Training",
  "AI Contents",
  "南青山 · Tokyo",
  "Est. 2024",
];

export default function CompanyPage() {
  return (
    <>
      <PageHero
        eyebrowNum="Co."
        label="Company"
        title="会社概要。"
        description="2024年5月、東京・南青山設立。AIマンツーマン教育・AI導入支援・AI研修を通じて、企業のAI活用を本質から支援するコンサルティング会社です。"
      />

      <section className="section section--dark" aria-labelledby="info-heading">
        <SectionHeader num="01" label="Overview" title="会社概要" id="info-heading" />

        <div className="company-layout">
          <Reveal as="div" variant="left">
            <div className="info-table" role="table" aria-label="会社情報">
              <div className="info-row" role="row">
                <span className="info-key" role="rowheader">
                  会社名
                </span>
                <span className="info-val" role="cell">
                  {siteConfig.name}
                </span>
              </div>
              <div className="info-row" role="row">
                <span className="info-key" role="rowheader">
                  設立
                </span>
                <span className="info-val" role="cell">
                  2024年5月27日
                </span>
              </div>
              <div className="info-row" role="row">
                <span className="info-key" role="rowheader">
                  代表取締役
                </span>
                <span className="info-val" role="cell">
                  {siteConfig.representative.name}
                </span>
              </div>
              <div className="info-row" role="row">
                <span className="info-key" role="rowheader">
                  取締役
                </span>
                <span className="info-val" role="cell">
                  {siteConfig.directors.map((d) => d.name).join(" / ")}
                </span>
              </div>
              <div className="info-row" role="row">
                <span className="info-key" role="rowheader">
                  資本金
                </span>
                <span className="info-val" role="cell">
                  {siteConfig.capital}
                </span>
              </div>
              <div className="info-row" role="row">
                <span className="info-key" role="rowheader">
                  所在地
                </span>
                <span className="info-val" role="cell">
                  〒{siteConfig.address.postalCode}
                  <br />
                  {siteConfig.address.region}
                  {siteConfig.address.locality} {siteConfig.address.blockNumber}
                  <br />
                  {siteConfig.address.building}
                </span>
              </div>
              <div className="info-row" role="row">
                <span className="info-key" role="rowheader">
                  事業内容
                </span>
                <span className="info-val" role="cell">
                  AIマンツーマン教育・個別指導
                  <br />
                  AI導入支援・業務自動化コンサルティング
                  <br />
                  AI研修・ワークショップの企画・運営
                  <br />
                  AIコンテンツ制作・自動化支援
                  <br />
                  映像制作・動画コンテンツ制作
                  <br />
                  Webサイト企画・制作・運営管理
                </span>
              </div>
              <div className="info-row" role="row">
                <span className="info-key" role="rowheader">
                  連絡先
                </span>
                <span className="info-val" role="cell">
                  <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
                  <br />
                  <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal as="div" variant="right">
            <div className="map-vis">
              <div className="map-vis__area">
                <iframe
                  className="map-vis__iframe"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=139.725%2C35.668%2C139.735%2C35.674&layer=mapnik&marker=35.67142%2C139.730"
                  title={`${siteConfig.name} 所在地マップ — 東京都港区南青山3-1-36`}
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <div className="map-vis__footer">
                <p className="num">35°40′17″N · 139°43′48″E</p>
                <p className="label" style={{ fontSize: "0.6rem", marginTop: "4px" }}>
                  南青山 · Minami-Aoyama, Minato-ku, Tokyo
                </p>
              </div>
            </div>

            <div className="contact-chips">
              <a
                href={siteConfig.phoneHref}
                className="contact-chip"
                aria-label={`${siteConfig.phone} に電話する`}
              >
                <span className="contact-chip__lbl">Phone</span>
                <span className="contact-chip__val">{siteConfig.phone}</span>
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="contact-chip"
                aria-label={`${siteConfig.email} にメールする`}
              >
                <span className="contact-chip__lbl">Email</span>
                <span className="contact-chip__val">{siteConfig.email}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Ticker items={TICKER_ITEMS} />

      <HomeCta
        bg="dark"
        eyebrow="Contact Us"
        title="お気軽にご相談ください。"
        sub="プロジェクトのご依頼・お見積もり・ご質問など、何でもお待ちしています。"
        primary={{ href: "/contact", label: "お問い合わせ" }}
        secondary={{ href: "/works", label: "実績を見る" }}
      />
    </>
  );
}
