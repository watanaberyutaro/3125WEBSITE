-- Phase 3: Git連携基盤
-- 承認された下書きのうち、実コード変更が必要な種別(service_page/cta_copy/faq/
-- landing_page/other)は publish_jobs に非同期ジョブとして積む。
-- 'article' 種別は既存のarticlesテーブル書き込みで完結するため、このテーブルは経由しない
-- （/columnはSupabaseから動的に描画されるCMSデータであり、Gitコミットが不要なため）。
--
-- ジョブ処理の起動: このテーブルへのINSERT後、pg_netトリガーで
-- https://3125.jp/api/jobs/process-publish を即座に呼び出す（Supabase Database Webhook
-- と同じ仕組みを素のSQLで組んでいる。理由: Webhookの認証シークレットをGit管理下の
-- マイグレーションファイルに平文で書きたくないため、Supabase Vaultに保管した値を
-- 関数内で都度参照する形にしている）。

create table publish_jobs (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references drafts(id) on delete cascade,
  draft_version_id uuid not null references draft_versions(id),
  target_path text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'succeeded', 'failed')),
  commit_sha text,
  commit_url text,
  error_message text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create index publish_jobs_draft_idx on publish_jobs (draft_id, created_at desc);
create index publish_jobs_status_idx on publish_jobs (status, created_at desc);

alter table publish_jobs enable row level security;

-- staffは閲覧・作成のみ。ステータス更新はwebhookハンドラがservice role keyで行う
-- （RLSを完全にバイパスするため、staff向けのUPDATEポリシーは意図的に作らない）。
create policy "staff can read publish_jobs"
  on publish_jobs for select
  using (is_staff());

create policy "staff can insert publish_jobs"
  on publish_jobs for insert
  with check (is_staff());

-- ── pg_netによるジョブ起動トリガー ──
create or replace function notify_publish_job()
returns trigger as $$
declare
  secret text;
begin
  select decrypted_secret into secret
  from vault.decrypted_secrets
  where name = 'publish_job_secret';

  if secret is null then
    raise warning 'publish_job_secret not found in vault; skipping webhook call';
    return new;
  end if;

  perform net.http_post(
    url := 'https://3125.jp/api/jobs/process-publish',
    headers := jsonb_build_object('Content-Type', 'application/json', 'X-Publish-Secret', secret),
    body := jsonb_build_object('jobId', new.id)
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public, vault, extensions;

create trigger publish_jobs_notify
  after insert on publish_jobs
  for each row execute function notify_publish_job();
