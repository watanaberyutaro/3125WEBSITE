-- Phase 2: 承認ワークフロー基盤
-- 設計方針:
--   drafts       = レビュー対象の論理単位（1件のコンテンツ企画）
--   draft_versions = drafts に対する本文の版（差分表示・再生成履歴のため独立テーブル）
--   review_comments = 承認/修正依頼/却下のコメント（誰が・いつ・どの版に対して）
-- job_runs（エージェント実行ログ）はフェーズ4、rejection_rules（NGパターン抽出）は
-- フェーズ7の担当範囲のため、ここでは作成しない。
--
-- 状態遷移: draft → needs_revision / rejected / approved
--           needs_revision → (新バージョン追加で) draft へ自動復帰
--           approved → published はフェーズ3（Git連携）が担当。ここでは値のみ用意する。
--           rejected は本テーブル内では終端（再挑戦する場合は新規draftを作る運用）。

create table drafts (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('article', 'service_page', 'cta_copy', 'faq', 'landing_page', 'other')),
  target_path text,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'needs_revision', 'rejected', 'approved', 'published')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index drafts_status_idx on drafts (status, updated_at desc);

create table draft_versions (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references drafts(id) on delete cascade,
  version_number integer not null,
  title text not null,
  body_markdown text not null default '',
  seo_title text,
  seo_description text,
  faq jsonb not null default '[]',
  cta_label text,
  cta_href text,
  generated_by text not null default 'manual' check (generated_by in ('manual', 'rule_based', 'local_llm', 'external_llm')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (draft_id, version_number)
);
create index draft_versions_draft_idx on draft_versions (draft_id, version_number desc);

create table review_comments (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references drafts(id) on delete cascade,
  draft_version_id uuid references draft_versions(id) on delete set null,
  comment_type text not null check (comment_type in ('revision', 'rejection', 'approval_note')),
  body text not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index review_comments_draft_idx on review_comments (draft_id, created_at desc);

-- updated_at自動更新（0001_init.sqlのset_updated_at()を再利用）
create trigger drafts_set_updated_at
  before update on drafts
  for each row execute function set_updated_at();

-- ── RLS: 完全にstaff専用（管理画面の運用データのため匿名アクセスは一切許可しない） ──
alter table drafts enable row level security;
alter table draft_versions enable row level security;
alter table review_comments enable row level security;

create policy "staff can manage drafts"
  on drafts for all
  using (is_staff())
  with check (is_staff());

create policy "staff can manage draft_versions"
  on draft_versions for all
  using (is_staff())
  with check (is_staff());

create policy "staff can manage review_comments"
  on review_comments for all
  using (is_staff())
  with check (is_staff());
