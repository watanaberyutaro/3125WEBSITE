-- Phase 8: 改善提案の自動化
--
-- articles.source_draft_id: reviewDraft()のarticle承認分岐が常にINSERTしていた
-- ため、公開済みdraftを再承認する経路（このフェーズで初めて到達可能になる）で
-- slugのUNIQUE制約違反または重複記事を引き起こす潜在バグがあった。この列で
-- 「どのdraftから生まれたarticleか」を追跡し、reviewDraft側でupsertできるように
-- する（lib/admin/drafts-actions.ts参照）。初回公開の挙動は無変更。
alter table articles add column source_draft_id uuid references drafts(id) on delete set null;
create index articles_source_draft_idx on articles (source_draft_id);

-- 公開済みコンテンツ（article/service_pageのみ。このAIパイプラインを経由して
-- 公開されたものに限定し、出自不明のレガシーコンテンツは対象外とする）に対する
-- 改善提案。staffが個別に「生成する」を押した時だけ作成される
-- （定期実行の全自動スキャンはしない。Phase7のルール化と同じ、人間の判断を
-- 必ず挟む設計方針を踏襲）。
create table improvement_suggestions (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references drafts(id) on delete cascade,
  issues jsonb not null default '[]',
  suggestion_text text,
  status text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index improvement_suggestions_draft_idx on improvement_suggestions (draft_id, created_at desc);
create index improvement_suggestions_status_idx on improvement_suggestions (status, created_at desc);

alter table improvement_suggestions enable row level security;

create policy "staff can manage improvement_suggestions"
  on improvement_suggestions for all
  using (is_staff())
  with check (is_staff());
