import type { Metadata } from "next";
import Link from "next/link";
import { HomeCta } from "@/components/layout/HomeCta";
import { WorksGrid } from "@/components/works/WorksGrid";
import { HomeNewsList } from "@/components/column/HomeNewsList";
import { getPublishedWorks } from "@/lib/works/queries";
import { getPublishedArticles } from "@/lib/column/queries";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

const TITLE = "3125株式会社 | AIで、ビジネスを変える。";
const DESCRIPTION =
  "3125株式会社はAIエージェンシーです。AIマンツーマン教育・AI導入支援・AI研修を通じて、経営者から現場担当者まで本質的なAI活用を支援します。まずはお気軽にご相談ください。";

const OG_DESCRIPTION = "AIマンツーマン教育・AI導入支援・AI研修を通して、ビジネスのAI活用を支援する。";

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
  {
    num: "07",
    title: "オーダーメイドシステム制作",
    body: "業務課題に合わせて設計するオリジナルの業務システム・アプリケーション開発。要件定義から設計・開発・運用保守まで、ビジネスに最適化されたシステムをフルスクラッチで構築します。",
    href: "/services#custom-system",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="5" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 12l-3 3 3 3M14 12l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    ),
  },
];

/* 特集面: 7つのサービスを「まなぶ・つくる・つたえる」の三つの面に分けて載せる */
const byHref = (h: string) => SERVICES.find((s) => s.href === h)!;
const CHAPTERS = [
  {
    en: "Learn", jp: "まなぶ", art: "feature-learn.jpg",
    cap: "買ったばかりの紙面を広げる紳士。学びは、まず手に取ることから。",
    items: [byHref("/services#education"), byHref("/services#training")],
  },
  {
    en: "Build", jp: "つくる", art: "feature-build.jpg",
    cap: "毎朝の仕組みを支える売店。棚も吊り下げも、使う人に合わせて組み立てる。",
    items: [byHref("/services#implementation"), byHref("/services#web"), byHref("/services#custom-system")],
  },
  {
    en: "Create", jp: "つたえる", art: "feature-create.jpg",
    cap: "店主から客の手へ。届けたいものを、相手に届く形で手渡す。",
    items: [byHref("/services#content"), byHref("/services#video")],
  },
];
const KANJI = ["一", "二", "三"];

/* 特集面で各サービスの下に添える「主な内容」（/services の一覧から抜粋） */
const POINTS: Record<string, string[]> = {
  "/services#education": ["ChatGPT・Claude・Gemini 実践活用", "業務別プロンプト設計・最適化", "継続的フォローアップ・定着支援"],
  "/services#training": ["AIリテラシー基礎研修（全社向け）", "部署別AI活用ワークショップ", "管理職・経営層向けAI戦略研修"],
  "/services#implementation": ["AI活用戦略・ロードマップ策定", "業務課題の分析とAIツール選定", "運用定着・継続サポート"],
  "/services#web": ["コーポレート・ブランドサイト制作", "採用・リクルートサイト制作", "保守・運用・SEO対策"],
  "/services#custom-system": ["業務システムの要件定義・設計", "業務効率化ツール・社内アプリの開発", "運用保守まで一貫して担当"],
  "/services#content": ["SNS投稿コンテンツの企画・制作・運用", "AI文章生成を使ったWeb記事・LP制作", "既存コンテンツのリライト・最適化"],
  "/services#video": ["企業PR・ブランディング映像", "採用・会社紹介動画", "SNS・Web広告用ショート動画"],
};

/* 特集面の各面の末尾に置く囲み（各サービス紹介の内容から） */
const CHAPTER_NOTES: Record<string, { head: string; body: string; listHead: string; list: string[] }> = {
  Learn: {
    head: "学び方は二通り",
    body: "経営者・担当者お一人に合わせた完全個別のマンツーマン指導と、チーム・部署・全社単位の研修。座学で終わらせず、翌日から使えるところまで手を動かします。",
    listHead: "対象",
    list: ["経営者・ビジネスパーソン", "チーム・部署・全社", "管理職・経営層"],
  },
  Create: {
    head: "制作は一貫して",
    body: "企画・構成から撮影・編集・公開まで、一つのチームで担当します。AIを活用して制作の手間を抑え、続けて発信できる体制まで整えます。",
    listHead: "制作物",
    list: ["企業PR・採用映像", "SNS投稿", "Web記事・LP", "画像・デザイン素材"],
  },
};

/* 第一面の記事に添える「支援の主な内容」（/services の一覧から抜粋） */
const FRONT_BRIEF = [
  "ChatGPT・Claude・Gemini 実践活用",
  "AI活用戦略・ロードマップ策定",
  "業務別プロンプト設計・最適化",
  "社内AI環境の構築・設定",
  "部署別AI活用ワークショップ",
  "管理職・経営層向けAI戦略研修",
];

const PILLARS = [
  { svcs: ["AIマンツーマン教育", "AI研修・ワークショップ"], shape: "helix", en: "Learn", jp: "まなぶ", caption: "「まなぶ」を表す立体模型。マンツーマン指導で「使える」から「使いこなす」へ。", body: "経営者・ビジネスパーソン向けの完全個別指導と、チーム単位の実践的なAI研修。" },
  { svcs: ["AI導入支援", "Web制作", "オーダーメイドシステム制作"], shape: "stack", en: "Build", jp: "つくる", caption: "「つくる」を表す立体模型。戦略策定から社内導入・運用定着まで一貫して伴走。", body: "AI導入の戦略策定から運用定着まで。Web制作とオーダーメイドのシステム開発も。" },
  { svcs: ["AIコンテンツ制作", "映像制作"], shape: "orbit", en: "Create", jp: "つたえる", caption: "「つたえる」を表す立体模型。AI×クリエイティブで映像・Web・SNSを制作。", body: "AIを活用した映像・Web・SNSコンテンツの制作と、企業PR・採用向けの映像制作。" },
];

const ArrowSvg = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export default async function HomePage() {
  const [works, latestNews] = await Promise.all([
    getPublishedWorks(),
    getPublishedArticles().then((articles) => articles.slice(0, 5)),
  ]);
  const gridWorks = works.slice(0, 6);

  return (
    <>
      {/* ── 第一面 ───────────────────────────────────────────── */}
      <section className="home-hero front" aria-labelledby="hero-heading">
        <header className="masthead">
          <div className="masthead__ear">
            <p className="label">Vol. 1 — No. 3125</p>
            <p>
              第一号
              <br />
              発行所　{siteConfig.name}
              <br />
              {siteConfig.address.region}
              {siteConfig.address.locality}
              {siteConfig.address.blockNumber}
            </p>
          </div>
          <div className="masthead__center">
            <p className="masthead__title">The 3125 Times</p>
            <p className="masthead__sub">三一二五新報　AI AGENCY</p>
          </div>
          <div className="masthead__ear masthead__ear--r">
            <p className="masthead__date" data-today="" suppressHydrationWarning />
            <p>
              本日の天気　晴れ ときどき AI
              <br />
              定価　無料相談 0円
            </p>
          </div>
        </header>
        <div className="masthead__bar" aria-hidden="true">
          <span>総合</span>
          <span>教育</span>
          <span>導入支援</span>
          <span>研修</span>
          <span>制作</span>
          <span>実績</span>
          <span className="masthead__bar-r">www.3125.jp</span>
        </div>

        <h1 className="front__band" id="hero-heading" data-split="">
          {siteConfig.tagline}
        </h1>
        <p className="display front__en" aria-hidden="true">
          <span data-split="">
            Change Business with <span className="chrome">AI.</span>
          </span>
        </p>

        <div className="hero-bar">
          <span className="marks" aria-hidden="true">+ — + — +</span>
          <p className="hero-bar__copy reveal d2">《 まなぶ・つくる・つたえる 》 三つの支援で伴走</p>
          <span className="marks" aria-hidden="true">+ — + — +</span>
        </div>

        <div className="front__grid">
          <div className="front__tate">
            <p className="tate-headline">「使える」を「使いこなす」へ</p>
            <p className="tate-sub">教育・導入・研修</p>
          </div>

          <article className="front__lead">
            <h2 className="front__subhead">
              マンツーマン教育から組織全体の導入まで
              <br />
              ビジネスに根ざしたAI活用を、本質から支援
            </h2>
            <div className="front__cols">
              <p className="dropcap">
                マンツーマン教育から組織全体のAI導入まで——あなたのビジネスに根ざした、実践的なAI活用を共に実現します。
              </p>
              <p>
                AIは誰もが使えるツールです。しかし「使える」と「使いこなす」には大きな差があります。私たちは、そのギャップを埋めるための教育・導入支援・研修を、一人ひとりのビジネスに合わせて提供します。
              </p>
              <p>
                技術の知識と教育のノウハウを融合させ、あなたのビジネスにAIを定着させる——それが{siteConfig.shortName}の使命です。
              </p>
              <p className="front__cont">
                <a href="#intro-heading">（社説に続く）</a>
              </p>
            </div>
            <blockquote className="front__pull">
              <p>「なんとなく使っている」を、「使いこなしている」へ。</p>
              <cite>— AIマンツーマン教育より</cite>
            </blockquote>
            <div className="front__brief">
              <h3 className="front__brief-head">支援の主な内容</h3>
              <ul>
                {FRONT_BRIEF.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href="/services" className="front__brief-more">
                七つのサービスを見る <ArrowSvg />
              </Link>
            </div>
          </article>

          <figure className="front__photo">
            <div className="hero-stage" data-3d="helix" data-drops="3" data-scale="0.78">
              <p className="hero-stage__tag">
                <b>Learn</b>
                <span>まなぶ</span>
              </p>
              <div className="hero-stage__nav">
                <button type="button" id="stagePrev" aria-label="前の領域">‹</button>
                <button type="button" id="stageNext" aria-label="次の領域">›</button>
              </div>
            </div>
            <figcaption className="hero-stage__caption" />
            <p className="front__credit">写真は支援領域を表す立体模型（イメージ）</p>
            <aside className="front__note">
              <p className="front__note-head">解説</p>
              <p>
                三つの支援は、別々のメニューではなく一つの流れです。「まなぶ」で使いこなす力をつけ、「つくる」で業務の仕組みに落とし込み、「つたえる」で価値として届ける。いまの課題に合う段階から、ご相談いただけます。
              </p>
            </aside>
          </figure>

          <div className="front__teasers" role="group" aria-label="3つの支援領域">
            {PILLARS.map((p, i) => (
              <button
                key={p.en}
                className="pillar"
                type="button"
                aria-pressed={i === 0}
                data-shape={p.shape}
                data-en={p.en}
                data-jp={p.jp}
                data-caption={p.caption}
              >
                <span className="pillar__no">
                  0{i + 1} · {p.en}
                </span>
                <span className="pillar__en">{p.jp}</span>
                <span className="pillar__jp">{p.body}</span>
                <span className="pillar__svcs">
                  {p.svcs.map((name) => (
                    <span key={name}>{name}</span>
                  ))}
                </span>
              </button>
            ))}
          </div>

          <aside className="front__side">
            <div className="front__index">
              <h3>本日の紙面</h3>
              <ul>
                <li><a href="#intro-heading">社説　AIの可能性を現場の力に</a><span>2</span></li>
                <li><a href="#chapters-heading">特集　七つの支援</a><span>3</span></li>
                {gridWorks.length > 0 && <li><a href="#works-heading">写真特集　制作実績</a><span>4</span></li>}
                {latestNews.length > 0 && <li><a href="#news-home-heading">短信　お知らせ</a><span>5</span></li>}
              </ul>
            </div>
            <div className="front__ad">
              <p className="front__ad-tag">広告</p>
              <p className="front__ad-head">
                AI活用の
                <br />
                ご相談は無料
              </p>
              <p className="front__ad-body">規模・業種を問わず、まずはお気軽にお問い合わせください。</p>
              <Link href="/contact" className="btn btn--gold">
                無料相談を申し込む <ArrowSvg />
              </Link>
              <p className="front__ad-tel">
                {siteConfig.phone}
                <br />
                {siteConfig.businessHours}
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ── 社説 ────────────────────────────────────────────── */}
      <section className="intro" aria-labelledby="intro-heading">
        <div className="intro__aside">
          <div className="intro__visual intro__visual--ink" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ink-art" src="/assets/images/editorial-sign.jpg" alt="" loading="lazy" decoding="async" />
            <span className="marks">+ + +</span>
            <span className="label">社説 · Editorial</span>
          </div>
          <blockquote className="intro__mission">
            <p className="intro__mission-k">Our Mission</p>
            <p className="intro__mission-q">AIの可能性を、ビジネスへ。</p>
            <p className="intro__mission-b">人とAIが共に機能する組織をつくるパートナーとして、伴走します。</p>
          </blockquote>
        </div>
        <div className="intro__copy">
          <h2 className="display intro__title" id="intro-heading">
            <span data-split="">Learn,</span>
            <span className="chrome" data-split="">Build,</span>
            <span data-split="">Create.</span>
          </h2>
          <div className="intro__body">
            <p className="kicker">社説</p>
            <p className="intro__lead reveal">
              AIの<em>可能性</em>を、現場の力に変える。
            </p>
            <p className="intro__text reveal d1">
              AIは誰もが使えるツールです。しかし「使える」と「使いこなす」には大きな差があります。私たちは、そのギャップを埋めるための教育・導入支援・研修を、一人ひとりのビジネスに合わせて提供します。
            </p>
            <p className="intro__text reveal d2">
              技術の知識と教育のノウハウを融合させ、あなたのビジネスにAIを定着させる——それが{siteConfig.shortName}の使命です。
            </p>
            <h3 className="intro__sub">道具の先にある「人」へ</h3>
            <p className="intro__text">
              AIは道具です。使いこなす人間があってはじめて価値が生まれる。私たちは技術の先にある「人の成長」と「ビジネスの変革」にフォーカスし、一社一社に向き合い続けます。
            </p>
            <p className="intro__text">
              理論だけのAI導入は意味がありません。実際の業務フローに溶け込み、担当者が自走できるAI活用の仕組みを設計します。
            </p>
            <h3 className="intro__sub">組織の思考と行動を変える</h3>
            <p className="intro__text">
              AIの導入は、ツールを使えるようにすることではありません。組織の思考と行動様式そのものを変えること——それが私たちの目指す支援です。人とAIが共に機能する組織をつくるパートナーとして伴走します。
            </p>
            <p className="intro__text">
              2024年の創業以来、マンツーマン教育・導入支援・研修を通じて、業種・規模を問わず多くの企業のAI活用を支援してきました。
            </p>
            <p className="intro__sign">{siteConfig.name}</p>
          </div>
          <div className="intro__foot">
            <span className="marks" aria-hidden="true">+ + +</span>
            <Link href="/about" className="link-arrow">
              About us <ArrowSvg />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 特集 ────────────────────────────────────────────── */}
      <section className="section feature" aria-labelledby="chapters-heading">
        <div className="feature__sheet">
          <header className="feature__tate">
            <p className="feature__kicker">特集</p>
            <h2 className="feature__title-tate" id="chapters-heading">七つの支援</h2>
            <p className="feature__pages">全三面</p>
          </header>
          <div className="feature__main">
            <p className="feature__lede">
              <span className="feature__lede-inner">
                <span className="feature__cap">新</span>
                聞を一部買い、広げ、誰かに手渡す。AIとの付き合い方も同じです。まず「まなぶ」、自社の仕組みとして「つくる」、そして価値として「つたえる」。{siteConfig.shortName}は、この三つの面から七つのサービスで事業を支えます。
              </span>
            </p>
            <div className="feature__grid">
              {CHAPTERS.map((c, i) => (
                <section className="feature__ch" aria-labelledby={`feature-ch-${i + 1}`} key={c.en}>
                  <header className="feature__head">
                    <span className="feature__num" aria-hidden="true">{KANJI[i]}</span>
                    <div>
                      <h3 className="feature__jp" id={`feature-ch-${i + 1}`}>{c.jp}</h3>
                      <span className="feature__en">{c.en}</span>
                    </div>
                  </header>
                  <figure className="feature__fig">
                    <div className="feature__art">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/assets/images/${c.art}`} alt="" loading="lazy" decoding="async" />
                    </div>
                    <figcaption>{c.cap}</figcaption>
                  </figure>
                  {c.items.map((svc) => (
                    <article className="feature__item" key={svc.num}>
                      <p className="feature__tag">サービス {svc.num}</p>
                      <h4 className="feature__title">{svc.title}</h4>
                      <p className="feature__body">{svc.body}</p>
                      {POINTS[svc.href] && (
                        <ul className="feature__points">
                          {POINTS[svc.href].map((pt) => (
                            <li key={pt}>{pt}</li>
                          ))}
                        </ul>
                      )}
                      <Link className="feature__more" href={svc.href}>詳しく見る →</Link>
                    </article>
                  ))}
                  {CHAPTER_NOTES[c.en] && (
                    <aside className="feature__note">
                      <p className="feature__note-head">{CHAPTER_NOTES[c.en].head}</p>
                      <p className="feature__note-body">{CHAPTER_NOTES[c.en].body}</p>
                      <p className="feature__note-list">
                        <b>{CHAPTER_NOTES[c.en].listHead}</b>
                        {CHAPTER_NOTES[c.en].list.map((x) => (
                          <span key={x}>{x}</span>
                        ))}
                      </p>
                    </aside>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 写真特集 ────────────────────────────────────────── */}
      {gridWorks.length > 0 && (
        <>
          <div className="marquee" aria-hidden="true">
            <div className="marquee__track">
              {Array.from({ length: 8 }, (_, i) => (
                <span className="display marquee__item" key={i}>Works</span>
              ))}
            </div>
          </div>
          <section className="section" aria-labelledby="works-heading">
            <div className="section__header--row">
              <div>
                <p className="kicker">写真特集</p>
                <h2 className="heading-lg" id="works-heading">制作実績</h2>
              </div>
              <Link href="/works" className="link-arrow">
                すべて見る <ArrowSvg />
              </Link>
            </div>
            <p className="wk-lede">
              コーポレートサイトから採用サイト、映像、写真まで。目的と届けたい相手を起点に、企画から公開・運用までご一緒した仕事の記録です。ここでは新しいものから{gridWorks.length}件を掲載しています。
            </p>
            <WorksGrid works={gridWorks} layout="feature" />
          </section>
        </>
      )}

      {/* ── 短信 ────────────────────────────────────────────── */}
      {latestNews.length > 0 && (
        <section className="section hn" aria-labelledby="news-home-heading">
          <div className="section__header--row">
            <div>
              <p className="kicker kicker--red">短信</p>
              <h2 className="heading-lg" id="news-home-heading">お知らせ</h2>
            </div>
            <Link href="/column" className="link-arrow">
              すべて見る <ArrowSvg />
            </Link>
          </div>
          <HomeNewsList articles={latestNews} />
        </section>
      )}

      {/* ── 広告 ────────────────────────────────────────────── */}
      <HomeCta
        bg="dark"
        eyebrow="Let's Work Together"
        title="AIの力で、ビジネスを変えませんか。"
        sub="規模や業種を問わず、あらゆるビジネスのAI活用をサポートします。まずはお気軽にご相談ください。"
        primary={{ href: "/contact", label: "無料相談を申し込む" }}
        secondary={{ href: "/works", label: "実績を見る" }}
      />

      {/* オープニング（初回のみ。public/paper/intro.js が描画） */}
      <div id="intro" className="intro-anim" role="img" aria-label="オープニング：新聞スタンドで新聞を買った紳士が紙面を広げ、その紙面に吸い込まれる">
        <button type="button" className="intro-anim__skip">skip →</button>
      </div>
    </>
  );
}
