/**
 * 制作実績の表示用の文言（紙面版）。
 * 分類名はデータ上 Web / Video / Photo の英語なので、紙面では和文の見出しと
 * サービス紹介（/services の本文と同じ内容）の短い説明を添える。
 */
export const WORK_CATEGORY_COPY: Record<string, { ja: string; note: string }> = {
  web: {
    ja: "Webサイト制作",
    note: "企画・デザイン・開発から公開後の運用まで、一貫して対応しています。",
  },
  video: {
    ja: "映像制作",
    note: "プランニングから撮影・編集・納品まで、目的に合わせて一貫して制作しています。",
  },
  photo: {
    ja: "写真撮影",
    note: "撮影の企画から仕上げまで、伝えたい印象に合わせて撮り下ろしています。",
  },
};

type CategoryRef = { name: string; slug: string } | null;

export function workCategoryLabel(category: CategoryRef): string {
  if (!category) return "Webサイト制作";
  return WORK_CATEGORY_COPY[category.slug]?.ja ?? category.name;
}

export function workCategoryNote(category: CategoryRef): string | null {
  return WORK_CATEGORY_COPY[category?.slug ?? "web"]?.note ?? null;
}
