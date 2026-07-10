/**
 * サイト全体で共有する固定情報。
 * 現行PHPサイト（about.html / contact.html / index.php フッター）の記載値を移植。
 */
export const siteConfig = {
  name: "3125株式会社",
  shortName: "3125",
  url: "https://3125.jp",
  tagline: "AIで、ビジネスを変える。",
  description:
    "AIマンツーマン教育・AI導入支援・AI研修。東京・南青山のAIエージェンシー。",
  locale: "ja_JP",
  phone: "090-1828-5970",
  phoneHref: "tel:09018285970",
  email: "info@3125.jp",
  address: {
    postalCode: "107-0062",
    region: "東京都",
    locality: "港区南青山",
    streetAddress: "3-1-36 青山マルタケビル6F",
    full: "〒107-0062 東京都港区南青山3-1-36 青山マルタケビル6F",
  },
} as const;
