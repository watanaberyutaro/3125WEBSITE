-- Phase 7: コメント学習と改善ループ
-- 却下・修正依頼コメント(review_comments)は下書き単位でしか参照されておらず、
-- 却下済み(terminal)の下書きに蓄積された指摘は今まで活用されず失われていた。
-- rejection_rulesは、staffが個別のコメントを明示的に「ルール化」した内容を
-- content_type横断で保持し、以降のAI生成プロンプトに注入するための
-- テーブル（0007_drafts_approval.sqlの冒頭コメントで既に予約されていた）。
--
-- 自動抽出はしない: 悪いルールが黙って全生成に混入するリスクを避けるため、
-- staffが個別のreview_commentsに対して明示的にボタンを押した時だけ
-- INSERTされる（lib/admin/rejection-rules-actions.ts参照）。

create table rejection_rules (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('article', 'service_page')),
  rule_text text not null,
  source_review_comment_id uuid references review_comments(id) on delete set null,
  active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index rejection_rules_content_type_idx on rejection_rules (content_type, active);

alter table rejection_rules enable row level security;

create policy "staff can manage rejection_rules"
  on rejection_rules for all
  using (is_staff())
  with check (is_staff());
