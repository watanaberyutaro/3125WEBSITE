-- 3125.jp — 初期スキーマ
-- 設計背景: works / articles / categories / inquiries / tool_leads を核に、
-- タクソノミーの重複を避けるため categories は kind 列で用途を分ける。

create extension if not exists pgcrypto;

-- ── profiles：Supabase Authユーザーに管理ロールを付与 ──
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  display_name text,
  created_at timestamptz not null default now()
);

-- ── categories：works/articles共通タクソノミー ──
create type category_kind as enum (
  'work_category', 'work_industry', 'article_category'
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  kind category_kind not null,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (kind, slug)
);

-- ── tags：記事タグ（多対多） ──
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

-- ── works：制作実績 ──
create table works (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  client_name text not null,
  project_name text not null,
  category_id uuid references categories(id),
  industry_id uuid references categories(id),
  year text,
  excerpt text,
  description text,
  external_link text,
  cover_image_path text,
  gallery jsonb not null default '[]',
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  og_image_path text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index works_status_sort_idx on works (status, sort_order);

-- ── articles：SEOコラム（旧News/Blog統合） ──
create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body_markdown text not null default '',
  category_id uuid references categories(id),
  cover_image_path text,
  source_link text,
  faq jsonb not null default '[]',
  related_article_ids uuid[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  og_image_path text,
  reading_minutes integer not null default 3,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index articles_status_published_idx on articles (status, published_at desc);

create table article_tags (
  article_id uuid references articles(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- ── inquiries：問い合わせフォーム ──
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text,
  inquiry_type text not null,
  budget text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'done')),
  source_path text,
  created_at timestamptz not null default now()
);

-- ── tool_leads：全AIツール共通ログ ──
create table tool_leads (
  id uuid primary key default gen_random_uuid(),
  tool_slug text not null,
  input jsonb not null,
  output jsonb,
  email text,
  created_at timestamptz not null default now()
);
create index tool_leads_slug_created_idx on tool_leads (tool_slug, created_at desc);

-- ── redirects：旧URL→新URLの301マップ（移行スクリプトが自動投入） ──
create table redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text unique not null,
  to_path text not null,
  status_code smallint not null default 301,
  created_at timestamptz not null default now()
);

-- updated_at 自動更新
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger works_set_updated_at
  before update on works
  for each row execute function set_updated_at();

create trigger articles_set_updated_at
  before update on articles
  for each row execute function set_updated_at();
