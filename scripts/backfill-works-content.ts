/**
 * work-01.html 〜 work-07.html（旧サイトの手作り詳細ページ）に書かれていた
 * Overview本文・Tags・Scope・Category表示ラベル・（work-07のみ）外部URLを、
 * Supabaseのworksテーブルへ反映する。
 * works.jsonにはこれらの情報が無かったため、migrate-from-php.ts とは別の
 * 一度きりのバックフィルスクリプトとして分離する。
 *
 * 実行: npx tsx --env-file=.env.local scripts/backfill-works-content.ts
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("環境変数が未設定です（.env.local）。");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const CONTENT: Record<
  string,
  {
    description: string;
    tags: string[];
    scope: string;
    categoryLabel: string;
    externalLink?: string;
  }
> = {
  "work-01": {
    description:
      "全国で毎年数万頭の犬猫が殺処分される現実。一般財団法人ペットの里が取り組む「殺処分ゼロ」への挑戦を、映像の力で社会に届けるPR動画を制作しました。\n\n感情に寄り添うナレーションと繊細な映像表現を組み合わせ、問題の深刻さと希望の両面を丁寧に描写。SNS拡散を前提としたテンポ感と、クラウドファンディング誘導を意識した構成で、視聴者の行動変容につながる映像に仕上げました。",
    tags: ["PR映像", "ソーシャルグッド", "撮影・編集", "ナレーション", "SNS向け"],
    scope: "企画 / 撮影 / 編集 / MA",
    categoryLabel: "映像制作",
  },
  "work-02": {
    description:
      "採用強化と企業ブランドの確立を両立させた、合同会社SHARE様の採用・ブランド紹介サイトを新規制作しました。\n\n会社の理念・カルチャー・働く仲間の姿を丁寧にコンテンツ化し、求職者が「一緒に働きたい」と感じられる体験設計を追求。シンプルで視認性の高いデザインと、モバイルファーストの実装により、応募率の向上に貢献しています。",
    tags: ["採用サイト", "ブランディング", "Webデザイン", "レスポンシブ", "コーポレート"],
    scope: "設計 / デザイン / コーディング",
    categoryLabel: "Webサイト制作",
  },
  "work-03": {
    description:
      "大切な一日のはじまりを彩る、結婚式オープニングムービーの制作を担当しました。\n\nお二人の出会い・デート・旅の記録など、提供いただいた写真・動画素材を丁寧に編集し、会場の雰囲気と音楽に合わせたストーリー構成で感動的な式の幕開けを演出。モーショングラフィクスとキネマティクスな映像表現を組み合わせ、ゲストの心に残る特別な映像に仕上げました。",
    tags: ["ウェディング映像", "オープニング", "モーショングラフィクス", "編集", "音楽選定"],
    scope: "企画 / 編集 / 音楽選定",
    categoryLabel: "映像制作",
  },
  "work-04": {
    description:
      "不動産テック領域でサービスを展開する株式会社visionestate様のコーポレートサイトをゼロから制作しました。\n\n会社のビジョン・プロダクト概要・チーム・採用情報を整理し、スタートアップらしいスピード感とプロフェッショナルな信頼感を両立したデザインを構築。SEO基盤も丁寧に整備し、自然流入の増加をサポートしています。",
    tags: ["コーポレートサイト", "不動産テック", "Webデザイン", "SEO", "新規制作"],
    scope: "設計 / デザイン / コーディング",
    categoryLabel: "Webサイト制作",
  },
  "work-05": {
    description:
      "IT・テクノロジー領域を中心に成長を続ける株式会社レジテック様の採用・ブランド紹介サイトを制作しました。\n\nエンジニア文化・働く環境・社員インタビューを中心に構成し、技術力と人の魅力が伝わるコンテンツ設計を実施。採用ターゲットとなるエンジニア・デザイナー層に響くビジュアル表現と、丁寧な情報設計により、採用競争力の強化を支援しています。",
    tags: ["採用サイト", "IT・テック", "エンジニア採用", "Webデザイン", "ブランディング"],
    scope: "設計 / デザイン / コーディング",
    categoryLabel: "Webサイト制作",
  },
  "work-06": {
    description:
      "Webサイトリニューアルに伴い、株式会社visionestate様のWebサイト用素材写真の撮影・編集を担当しました。\n\nオフィス環境・チームメンバーのポートレート・プロダクトイメージを一日かけて撮影。ブランドカラーと世界観に合わせたライティングと構図で撮影し、納品後のレタッチ・色調整まで一貫して対応。Webサイト全体のビジュアルクオリティ向上に貢献しました。",
    tags: ["写真撮影", "レタッチ", "オフィス撮影", "ポートレート", "Web素材"],
    scope: "撮影 / レタッチ / 納品",
    categoryLabel: "写真撮影・編集",
  },
  "work-07": {
    description:
      "AI技術を活用した履歴書自動生成プラットフォーム「カクナラ」のWebサービス開発を担当しました。\n\n経歴を入力するだけでAIがプロ品質の職務要約・自己PR・志望動機を瞬時に生成するサービスの企画・設計から、デザイン・実装まで一貫して対応。スカウト機能やプライバシー保護といった差別化ポイントをUX上でわかりやすく訴求し、求職者・企業双方にとって使いやすいプラットフォームを構築しました。",
    tags: ["Webデザイン", "HRテック", "AI活用", "転職支援", "ブランディング", "Webサービス"],
    scope: "設計 / デザイン / コーディング",
    categoryLabel: "Webサービス開発",
    externalLink: "https://kakunara.jp",
  },
};

async function main() {
  for (const [slug, c] of Object.entries(CONTENT)) {
    const { error } = await supabase
      .from("works")
      .update({
        description: c.description,
        tags: c.tags,
        scope: c.scope,
        category_label: c.categoryLabel,
        external_link: c.externalLink ?? null,
      })
      .eq("slug", slug);
    if (error) throw new Error(`更新失敗 (${slug}): ${error.message}`);
    console.log(`  ✓ ${slug}`);
  }
  console.log("\nバックフィル完了。");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
