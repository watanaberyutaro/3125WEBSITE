-- 初期タクソノミー。旧サイト(works.json/news.json)の実データに合わせて投入する。
-- 移行スクリプト(scripts/migrate-from-php.ts)はここで確定したslugを参照する。

insert into categories (kind, name, slug, sort_order) values
  ('work_category', 'Video', 'video', 1),
  ('work_category', 'Web', 'web', 2),
  ('work_category', 'Photo', 'photo', 3)
on conflict (kind, slug) do nothing;

insert into categories (kind, name, slug, sort_order) values
  ('work_industry', '非営利・公益財団', 'nonprofit-public', 1),
  ('work_industry', 'サービス業', 'service-industry', 2),
  ('work_industry', 'ウェディング', 'wedding', 3),
  ('work_industry', '不動産テック', 'real-estate-tech', 4),
  ('work_industry', 'IT・テクノロジー', 'it-technology', 5),
  ('work_industry', 'HRテック・転職支援', 'hr-tech-career', 6)
on conflict (kind, slug) do nothing;

-- Column(SEO記事)用の初期カテゴリ。旧News/Blogのtype分類を踏襲した最小セット。
-- Phase 4で本格的な記事タクソノミーを設計する際に追加・見直しを行う。
insert into categories (kind, name, slug, sort_order) values
  ('article_category', 'お知らせ', 'news', 1),
  ('article_category', 'コラム', 'blog', 2)
on conflict (kind, slug) do nothing;
