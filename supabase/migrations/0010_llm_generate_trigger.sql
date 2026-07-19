-- Phase 6: 記事・サービスページの自動生成
-- job_runs.kind='generate'のうち、AI Gateway(ローカルLLM)経由の生成
-- (input->>'source' = 'llm')だけを非同期Webhookで処理する。
-- Phase4のルールベース生成(runGenerateFromComments)は常に同期で終端ステータスを
-- 直接INSERTするため、このトリガーの対象にはならない(WHEN句で除外)。
--
-- publish_jobs(0008_publish_jobs.sql)のnotify_publish_job()と全く同じ形:
-- Vaultからシークレットを参照し、net.http_postでWebhookを起動する
-- (シークレットの平文はこのマイグレーションに含めない。Supabase Management API
-- 経由でvault.create_secret()を別途一度だけ実行して作成する)。
--
-- AI Gatewayの応答が数十秒〜300秒近くかかることが実測で判明しているため、
-- net.http_postのtimeout_millisecondsを長めに設定する。ただし、これは
-- Postgres側の観測用タイムアウトであり、Vercel関数自体の実行継続とは独立
-- (pg_netがタイムアウトしたと判断しても、既に起動済みのVercel関数は
-- 自身のmaxDuration設定に従って処理を継続し、job_runsを直接更新する)。

create or replace function notify_llm_generate_job()
returns trigger as $$
declare
  secret text;
begin
  if new.kind <> 'generate' or (new.input->>'source') <> 'llm' then
    return new;
  end if;

  select decrypted_secret into secret
  from vault.decrypted_secrets
  where name = 'llm_generate_secret';

  if secret is null then
    raise warning 'llm_generate_secret not found in vault; skipping webhook call';
    return new;
  end if;

  perform net.http_post(
    url := 'https://3125.jp/api/jobs/process-generate',
    headers := jsonb_build_object('Content-Type', 'application/json', 'X-Generate-Secret', secret),
    body := jsonb_build_object('jobId', new.id),
    timeout_milliseconds := 300000
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public, vault, extensions;

create trigger job_runs_llm_generate_notify
  after insert on job_runs
  for each row execute function notify_llm_generate_job();
