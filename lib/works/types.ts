export type WorkCategoryRef = { name: string; slug: string };

export type WorkListItem = {
  slug: string;
  clientName: string;
  projectName: string;
  year: string | null;
  sortOrder: number;
  coverImageUrl: string | null;
  category: WorkCategoryRef | null;
  industry: WorkCategoryRef | null;
};

export type WorkDetail = WorkListItem & {
  description: string | null;
  excerpt: string | null;
  tags: string[];
  scope: string | null;
  categoryLabel: string | null;
  externalLink: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  publishedAt: string | null;
  updatedAt: string;
};
