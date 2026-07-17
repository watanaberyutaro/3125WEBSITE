"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * publish_jobsはSupabase側のpg_netトリガーが非同期に処理するため、
 * Server Actionのレスポンスが返った時点ではまだ結果が確定していないことが多い。
 * pending/processing中のジョブがある間だけ数秒おきにrouter.refresh()して
 * 最新のジョブステータスを取得し直す。
 */
export function PublishJobAutoRefresh({ hasPendingJob }: { hasPendingJob: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasPendingJob) return;
    const interval = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(interval);
  }, [hasPendingJob, router]);

  return null;
}
