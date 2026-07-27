-- 記事ネタ自動生成: 過去記事と重複しない新規記事の企画(タイトル+概要)をAIに
-- 提案させ、staffが選んだものだけをAI生成ジョブ(既存のjob_runs/process-generate
-- 経路)に流し込む。改善提案(improvement_suggestions)と同じく、定期実行の
-- 全自動生成はせず、staffが「生成する」を押した時だけ作成される。
create table article_topic_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brief text not null,
  status text not null default 'pending' check (status in ('pending', 'used', 'dismissed')),
  used_draft_id uuid references drafts(id) on delete set null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index article_topic_ideas_status_idx on article_topic_ideas (status, created_at desc);

alter table article_topic_ideas enable row level security;

create policy "staff can manage article_topic_ideas"
  on article_topic_ideas for all
  using (is_staff())
  with check (is_staff());
