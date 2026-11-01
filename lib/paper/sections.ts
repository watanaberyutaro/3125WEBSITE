/**
 * 紙面版: 各ページを新聞の「面」として扱うための対応表。
 * 面の名前・挿絵（オープニングの新聞スタンドの絵からの切り抜き）・キャプション。
 */
export type PaperSection = { men: string; section: string; art: string; caption: string; plate: string };

const SECTIONS: Record<string, PaperSection> = {
  about: { plate: "About", men: "第二面", section: "会社案内", art: "editorial-sign.jpg", caption: "街角に掲げた看板。毎朝ここから一日が始まる。" },
  services: { plate: "Services", men: "第三面", section: "事業", art: "feature-build.jpg", caption: "必要なものを、使う人に合わせて揃えた売店の棚。" },
  works: { plate: "Works", men: "第四面", section: "写真特集", art: "ink-hanging.jpg", caption: "店先に吊るされた、今日の紙面。" },
  column: { plate: "News", men: "第五面", section: "短信", art: "feature-learn.jpg", caption: "届いたばかりの紙面に目を通す。" },
  company: { plate: "Company", men: "第六面", section: "会社概要", art: "cta-board.jpg", caption: "店先の立て看板。今日の知らせはここに。" },
  contact: { plate: "Contact", men: "第七面", section: "投書・お問い合わせ", art: "feature-create.jpg", caption: "窓口で、手から手へ。" },
  tools: { plate: "Tools", men: "第八面", section: "道具箱", art: "feature-build.jpg", caption: "棚に並んだ道具は、どれも自由に手に取れる。" },
};

export function paperSectionFor(pathname: string): PaperSection | null {
  const key = pathname.split("/").filter(Boolean)[0] ?? "";
  return SECTIONS[key] ?? null;
}
