/**
 * サイト全体で共有する固定情報。
 * 現行PHPサイト（about.html / company.html / contact.html / index.phpフッター）の記載値を移植。
 */
export const siteConfig = {
  name: "3125株式会社",
  shortName: "3125",
  url: "https://3125.jp",
  tagline: "AIで、ビジネスを変える。",
  description: "AIマンツーマン教育・AI導入支援・AI研修を通じて、ビジネスのAI活用を支援するAIエージェンシー。",
  locale: "ja_JP",
  foundingDate: "2024-05-27",
  capital: "1000000円",
  phone: "090-1000-1930",
  phoneHref: "tel:09010001930",
  email: "info@3125.jp",
  businessHours: "平日 10:00 – 18:00",
  address: {
    postalCode: "107-0062",
    region: "東京都",
    locality: "港区南青山",
    blockNumber: "3-1-36",
    building: "青山マルタケビル6F",
    streetAddress: "3-1-36 青山マルタケビル6F",
    full: "〒107-0062 東京都港区南青山3-1-36 青山マルタケビル6F",
  },
  representative: { name: "渡邊 隆太郎", nameEn: "Ryutaro Watanabe" },
  directors: [
    { name: "大須 はるか", nameEn: "Haruka Osu" },
    { name: "佐藤 一斗", nameEn: "Kazuto Sato" },
  ],
} as const;
