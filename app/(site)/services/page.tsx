import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { HomeCta } from "@/components/layout/HomeCta";
import { Reveal } from "@/components/motion/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { buildMetadata } from "@/lib/seo/metadata";

const TITLE = "AIマンツーマン教育・AI導入支援・AI研修";
const DESCRIPTION =
  "3125株式会社のサービス — AIマンツーマン教育・AI導入支援・AI研修・AIコンテンツ制作・映像制作・Web制作。ビジネスのAI活用をトータルサポートします。";

export const metadata: Metadata = buildMetadata({ title: TITLE, description: DESCRIPTION, path: "/services" });

const SERVICES = [
  {
    id: "education",
    num: "01",
    en: "AI Education",
    title: "AIマンツーマン教育",
    body: "経営者・ビジネスパーソン向けの完全個別指導。ChatGPT・Claude・Geminiなどの生成AIツールから、業務特化型AIまで、あなたの仕事に直結したAI活用を実践的にレクチャーします。「なんとなく使っている」を「使いこなしている」に変えます。",
    ctaLabel: "マンツーマン指導を申し込む",
    list: [
      "ChatGPT・Claude・Gemini 実践活用",
      "業務別プロンプト設計・最適化",
      "AI文書作成・資料制作の効率化",
      "営業・マーケティングへのAI活用",
      "経営判断・情報収集へのAI導入",
      "継続的フォローアップ・定着支援",
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="11" r="4.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 27c0-5 4-9 9-9s9 4 9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M24 9l2.5 2.5L24 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <path d="M26.5 11.5h-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "implementation",
    num: "02",
    en: "AI Implementation",
    title: "AI導入支援",
    body: "「AIを使いたいが何から始めればよいかわからない」という企業様のために、AI活用戦略の策定からツール選定・社内導入・運用定着まで一貫してサポートします。業務効率化・コスト削減・売上向上を実現するAI活用を一緒に設計します。",
    ctaLabel: "AI導入を相談する",
    list: [
      "AI活用戦略・ロードマップ策定",
      "業務課題の分析とAIツール選定",
      "社内AI環境の構築・設定",
      "既存業務フローへのAI統合",
      "効果測定・KPI設計",
      "運用定着・継続サポート",
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="3" y="8" width="26" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 16h12M19 12l5 4-5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "training",
    num: "03",
    en: "AI Training",
    title: "AI研修・ワークショップ",
    body: "チーム・部署・全社単位でのAIリテラシー向上研修を提供します。座学だけでなく実際にAIを使うワークショップ形式を中心に、社員が翌日から使えるレベルまでの実践的な研修プログラムを設計・実施します。",
    ctaLabel: "研修を依頼する",
    list: [
      "AIリテラシー基礎研修（全社向け）",
      "部署別AI活用ワークショップ",
      "管理職・経営層向けAI戦略研修",
      "プロンプトエンジニアリング実践講座",
      "業界特化型AIユースケース研修",
      "研修教材・社内マニュアル作成",
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="3" y="6" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="9" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        <circle cx="16" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        <circle cx="23" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        <path d="M8 26v2M16 26v2M24 26v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "content",
    num: "04",
    en: "AI Content",
    title: "AIコンテンツ制作",
    body: "AIを活用した映像・Web・SNSコンテンツの制作代行サービスです。AIによる企画・構成から、撮影・編集・公開までを一貫して担当。制作コストを抑えながら、高品質なブランドコンテンツを効率的に量産します。",
    ctaLabel: "コンテンツ制作を依頼する",
    list: [
      "AI活用による映像・動画コンテンツ制作",
      "AI文章生成を使ったWeb記事・LP制作",
      "SNS投稿コンテンツの企画・制作・運用",
      "AI画像・デザイン素材の生成・活用",
      "コンテンツカレンダー設計・量産体制構築",
      "既存コンテンツのAIによるリライト・最適化",
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M5 8h22M5 13h16M5 18h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="25" cy="22" r="4.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M27.2 24.2l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "video",
    num: "05",
    en: "Video Production",
    title: "映像制作",
    body: "企業PR・採用・商品紹介・SNS向けなど、目的に合わせた映像をプランニングから撮影・編集・納品まで一貫して制作します。ブランドの世界観を映像で表現し、伝えたいメッセージを確実に届けます。",
    ctaLabel: "映像制作を相談する",
    list: [
      "企業PR・ブランディング映像",
      "採用・会社紹介動画",
      "商品・サービス紹介動画",
      "SNS・Web広告用ショート動画",
      "セミナー・イベント撮影・編集",
      "インタビュー・事例紹介映像",
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="8" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M22 13l8-4v14l-8-4V13z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "web",
    num: "06",
    en: "Web Production",
    title: "Web制作",
    body: "コーポレートサイト・採用サイト・ランディングページ・ECサイトなど、目的に応じたWebサイトを企画・デザイン・開発・運用まで一貫して対応します。デザインの美しさと成果につながる設計を両立します。",
    ctaLabel: "Web制作を相談する",
    list: [
      "コーポレート・ブランドサイト制作",
      "採用・リクルートサイト制作",
      "ランディングページ（LP）制作",
      "ECサイト・オンラインショップ構築",
      "Webサイトのリニューアル・改善",
      "保守・運用・SEO対策",
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="4" width="28" height="20" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 26h12M16 24v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M10 14l4 4-4 4M17 20h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    ),
  },
];

export default function ServicesPage() {
  return (
    <>
      <Breadcrumb items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]} />
      <PageHero
        eyebrowNum="Srv"
        label="Services"
        title="支援の全領域へ。"
        description="AI教育・導入支援・研修から映像制作・Web制作まで、ビジネスの課題を6つのサービスでトータルサポートします。"
      />

      {SERVICES.map((svc, i) => (
        <div key={svc.id}>
          <section
            className={`section section--dark${i % 2 === 1 ? " svc-section--alt" : ""}`}
            id={svc.id}
            aria-labelledby={`${svc.id}-heading`}
          >
            <Reveal as="div" className="svc">
              <div className="svc__meta">
                <span className="svc__num">{svc.num}</span>
                <span className="svc__sep" aria-hidden="true" />
                <span className="svc__en">{svc.en}</span>
              </div>
              <div className="svc__main">
                <div className="svc__left">
                  <div className="svc__icon" aria-hidden="true">
                    {svc.icon}
                  </div>
                  <h2 className="svc__title" id={`${svc.id}-heading`}>
                    {svc.title}
                  </h2>
                  <p className="svc__body">{svc.body}</p>
                  <CtaButton href="/contact" variant="outline-gold">
                    {svc.ctaLabel}
                  </CtaButton>
                </div>
                <div className="svc__right">
                  <ul className="svc__list" role="list">
                    {svc.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="svc__ghost" aria-hidden="true">
                {svc.num}
              </div>
            </Reveal>
          </section>
          {i < SERVICES.length - 1 && <div className="hr" />}
        </div>
      ))}

      <HomeCta
        bg="dark2"
        eyebrow="Get Started"
        title="まず、ご相談から始めましょう。"
        sub="どのサービスについてもお気軽にお問い合わせください。最適なプランをご提案します。"
        primary={{ href: "/contact", label: "無料相談を申し込む" }}
        secondary={{ href: "/works", label: "実績を見る" }}
      />
    </>
  );
}
