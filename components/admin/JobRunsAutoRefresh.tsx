"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * PublishJobAutoRefresh.tsxと同型・同ロジック。job_runs用に独立させた
 * （Phase3で検証済みのコンポーネントを流用/改名するリスクを避けるため、
 * 意図的に小さな重複を許容している）。
 * AI Gateway経由の生成(kind='generate', input.source='llm')はpg_netトリガーで
 * 非同期に処理されるため、Server Actionのレスポンスが返った時点ではまだ
 * 結果が確定していない。pending/processing中のジョブがある間だけ
 * 数秒おきにrouter.refresh()して最新のジョブステータスを取得し直す。
 */
export function JobRunsAutoRefresh({ hasPendingJob }: { hasPendingJob: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasPendingJob) return;
    const interval = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(interval);
  }, [hasPendingJob, router]);

  return null;
}
