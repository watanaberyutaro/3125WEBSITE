export type ArticleCategoryRef = { name: string; slug: string };
export type ArticleTagRef = { name: string; slug: string };

export type ArticleListItem = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: ArticleCategoryRef | null;
  publishedAt: string | null;
  readingMinutes: number;
};

export type ArticleDetail = ArticleListItem & {
  bodyHtml: string;
  headings: { id: string; text: string; level: 2 | 3 }[];
  tags: ArticleTagRef[];
  faq: { question: string; answer: string }[];
  sourceLink: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  updatedAt: string;
  relatedArticles: ArticleListItem[];
};
