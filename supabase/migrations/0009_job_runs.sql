-- Phase 4: エージェント分業化とジョブオーケストレーション
-- research/generate/reviewの3ロールの実行ログを1テーブルに集約する。
-- 'publish'は含めない: publish_jobs(0008)が既にこの責務を完全に担っており、
-- ここに重複定義するとジョブ管理系が2系統に分裂し、フェーズ3で検証済みの
-- 挙動に触れるリスクが生じるため。job_runsはresult_draft_version_idで
-- 「どのバージョンを経て承認・publish_jobsに至ったか」を追跡できれば十分。
--
-- publish_jobsと異なりstatus状態機械はあるが、pg_netトリガーは持たない:
-- research/generate/review はフェーズ4時点では外部通信もLLM呼び出しも行わない
-- 同期処理のため、Server Action内でpending→processing→succeeded/failedまで
-- 完結する。将来フェーズ6でlocal_llm対応のgenerateが非同期処理になった際は、
-- publish_jobsと同じpg_net方式をkind='generate'のうち該当ケースにだけ
-- 追加すればよい設計にしてある。

create table job_runs (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references drafts(id) on delete cascade,
  draft_version_id uuid references draft_versions(id) on delete set null,
  result_draft_version_id uuid references draft_versions(id) on delete set null,
  kind text not null check (kind in ('research', 'generate', 'review')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'succeeded', 'failed')),
  input jsonb not null default '{}',
  output jsonb not null default '{}',
  error_message text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create index job_runs_draft_idx on job_runs (draft_id, created_at desc);
create index job_runs_status_idx on job_runs (status, created_at desc);

-- ── RLS: staff全権限（publish_jobsとは異なる形） ──
-- publish_jobsがUPDATEをservice roleに限定しているのは、非同期webhookが
-- staffセッション外で状態を更新するため。job_runsはこのフェーズでは常に
-- 発行元と同じstaffセッションのServer Action内でpending→succeeded/failedまで
-- 完結するため、drafts/draft_versions/review_commentsと同じ
-- 「staffは全操作可」ポリシーで十分かつ整合的。
alter table job_runs enable row level security;

create policy "staff can manage job_runs"
  on job_runs for all
  using (is_staff())
  with check (is_staff());
