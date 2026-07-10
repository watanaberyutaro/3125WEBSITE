import type { Metadata } from "next";
import Link from "next/link";
import { HomeCta } from "@/components/layout/HomeCta";
import { SectionHeaderRow } from "@/components/layout/SectionHeader";
import { Ticker } from "@/components/layout/Ticker";
import { Loader } from "@/components/motion/Loader";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGrid } from "@/components/motion/RevealGrid";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { CtaButton } from "@/components/ui/CtaButton";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { WorksCarousel } from "@/components/works/WorksCarousel";
import { HomeNewsList } from "@/components/column/HomeNewsList";
import { getPublishedWorks } from "@/lib/works/queries";
import { getPublishedArticles } from "@/lib/column/queries";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

const TITLE = "3125株式会社 | AIで、ビジネスを変える。";
const DESCRIPTION =
  "3125株式会社は、東京・南青山を拠点とするAIエージェンシーです。AIマンツーマン教育・AI導入支援・AI研修を通じて、経営者から現場担当者まで本質的なAI活用を支援します。まずはお気軽にご相談ください。";

const OG_DESCRIPTION =
  "AIマンツーマン教育・AI導入支援・AI研修を通して、ビジネスのAI活用を支援する。東京・南青山のAIエージェンシー。";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: OG_DESCRIPTION,
    url: "/",
    images: ["/assets/images/ogp.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: OG_DESCRIPTION,
    images: ["/assets/images/ogp.jpg"],
  },
};

const TICKER_ITEMS = [
  "AIマンツーマン教育",
  "AI Implementation",
  "AI研修・ワークショップ",
  "AI Content Creation",
  "AI Strategy",
  "AI Education",
  "Aoyama, Tokyo",
  "Est. 2024",
];

const SERVICES = [
  {
    num: "01",
    title: "AIマンツーマン教育",
    body: "経営者・ビジネスパーソン向けの完全個別指導。ChatGPT・Claude・Geminiなど各種AIツールの実践的な活用を、あなたの業務に合わせてハンズオンで指導します。",
    href: "/services#education",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="4" stroke="currentColor" strokeWidth="1.4" />
        <path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M21 8l2 2-2 2M23 10h-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "AI導入支援",
    body: "AI活用戦略の策定からツール選定・社内導入・運用定着まで一貫サポート。業務効率化とコスト削減を実現します。",
    href: "/services#implementation",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="7" width="22" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 14h10M9 11h6M9 17h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
        <path d="M22 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "AI研修・ワークショップ",
    body: "チーム・部署・全社単位でのAIリテラシー向上研修。実践的なワークショップ形式で、社員のAI活用力を組織全体で高めます。",
    href: "/services#training",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="5" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="8" cy="13" r="2" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        <circle cx="14" cy="13" r="2" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        <circle cx="20" cy="13" r="2" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        <path d="M7 22v2M14 22v2M21 22v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "AIコンテンツ制作",
    body: "AIを活用した映像・Web・SNSコンテンツの制作代行。AI×クリエイティブの掛け合わせで、高品質なコンテンツを効率的に制作・運用します。",
    href: "/services#content",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M5 8h18M5 13h12M5 18h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="22" cy="18" r="3.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M24.5 20.5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "05",
    title: "映像制作",
    body: "企業PR・採用・商品紹介など、目的に応じた映像をプランニングから撮影・編集・納品まで一貫して制作します。",
    href: "/services#video",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="7" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M20 11l8-4v14l-8-4V11z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: "06",
    title: "Web制作",
    body: "コーポレートサイト・採用サイト・LPなど、デザインの美しさと成果につながる設計を両立したWebサイトを制作します。",
    href: "/services#web",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="4" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 24h10M14 20v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M8 12l4 4-4 4M15 16h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    ),
  },
];

export default async function HomePage() {
  const [works, latestNews] = await Promise.all([
    getPublishedWorks(),
    getPublishedArticles().then((articles) => articles.slice(0, 5)),
  ]);
  const carouselWorks = [...works].sort((a, b) => b.sortOrder - a.sortOrder).slice(0, 7);

  return (
    <>
      <Loader />

      <section className="home-hero" aria-labelledby="hero-heading">
        <div className="home-hero__bg" aria-hidden="true">
          <div className="home-hero__orb home-hero__orb--1" />
          <div className="home-hero__orb home-hero__orb--2" />
        </div>
        <div className="home-hero__ghost" aria-hidden="true">
          3125
        </div>
        <div className="home-hero__topbar" aria-hidden="true">
          <span className="label">Est. 2024 · Tokyo</span>
          <span className="num">35°40′N · 139°43′E</span>
        </div>
        <div className="home-hero__inner">
          <Reveal as="div" delay={1} className="home-hero__eyebrow">
            <span className="home-hero__eyebrow-line" aria-hidden="true" />
            <span className="label">AI Agency · Tokyo</span>
          </Reveal>
          <Reveal as="h1" delay={2} className="home-hero__headline" id="hero-heading">
            <span className="home-hero__display">AIで、</span>
            <span className="home-hero__display2">ビジネスを変える。</span>
            <span className="home-hero__jp-tagline">
              東京・南青山発。AIマンツーマン教育から組織全体の導入まで、本質から支援する。
            </span>
          </Reveal>
          <Reveal as="p" delay={3} className="home-hero__sub">
            東京・南青山発。マンツーマン教育から組織全体のAI導入まで——あなたのビジネスに根ざした、実践的なAI活用を共に実現します。
          </Reveal>
          <Reveal as="div" delay={4} className="home-hero__actions">
            <CtaButton href="/contact" variant="gold" magnetic>
              無料相談を申し込む
            </CtaButton>
            <CtaButton href="/works" variant="outline">
              制作実績を見る
            </CtaButton>
          </Reveal>
          <Reveal as="div" delay={5} className="home-hero__bottom">
            <div className="home-hero__scroll" aria-hidden="true">
              <span>Scroll</span>
              <div className="home-hero__scroll-line" />
            </div>
          </Reveal>
        </div>
      </section>

      <Ticker items={TICKER_ITEMS} />

      <section className="philosophy-strip section--dark2">
        <div className="philosophy-strip__inner">
          <Reveal as="div" variant="left">
            <p className="label mb-sm">Our Philosophy</p>
            <p className="philosophy-strip__quote">
              AIの<em>可能性</em>を
              <br />
              現場の力に変える。
            </p>
          </Reveal>
          <Reveal as="div" variant="right">
            <p className="philosophy-strip__body">
              AIは誰もが使えるツールです。しかし「使える」と「使いこなす」には大きな差があります。私たちは、そのギャップを埋めるための教育・導入支援・研修を、一人ひとりのビジネスに合わせて提供します。
            </p>
            <p className="philosophy-strip__body">
              技術の知識と教育のノウハウを融合させ、あなたのビジネスにAIを定着させる——それが{siteConfig.shortName}の使命です。
            </p>
            <LinkArrow href="/about">About us</LinkArrow>
          </Reveal>
        </div>
      </section>

      <section className="section section--dark" aria-labelledby="services-heading">
        <SectionHeaderRow num="01" label="Services" title="提供サービス" moreHref="/services" id="services-heading" />

        <RevealGrid className="service-grid">
          {SERVICES.map((svc) => (
            <article className="service-item" key={svc.num}>
              <div className="service-item__icon" aria-hidden="true">
                {svc.icon}
              </div>
              <p className="service-item__num">{svc.num}</p>
              <h3 className="service-item__title">{svc.title}</h3>
              <p className="service-item__body">{svc.body}</p>
              <Link href={svc.href} className="service-item__link">
                詳細を見る <ArrowIcon size={10} />
              </Link>
            </article>
          ))}
        </RevealGrid>
      </section>

      {carouselWorks.length > 0 && (
        <section className="section section--dark3" aria-labelledby="works-heading">
          <SectionHeaderRow num="02" label="Works" title="制作実績" moreHref="/works" id="works-heading" />
          <WorksCarousel works={carouselWorks} />
        </section>
      )}

      {latestNews.length > 0 && (
        <section className="section section--dark hn" aria-labelledby="news-home-heading">
          <SectionHeaderRow num="03" label="News & Blog" title="お知らせ" moreHref="/column" id="news-home-heading" />
          <HomeNewsList articles={latestNews} />
        </section>
      )}

      <HomeCta
        bg="dark"
        eyebrow="Let's Work Together"
        title="AIの力で、ビジネスを変えませんか。"
        sub="規模や業種を問わず、あらゆるビジネスのAI活用をサポートします。まずはお気軽にご相談ください。"
        primary={{ href: "/contact", label: "無料相談を申し込む" }}
        secondary={{ href: "/works", label: "実績を見る" }}
      />
    </>
  );
}
