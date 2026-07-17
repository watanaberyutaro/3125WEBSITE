/**
 * GitHub Contents API の薄いラッパー。単一ファイルの作成/更新のみを扱う
 * （publish_jobsは1ジョブ=1ファイルという設計のため、複数ファイルにまたがる
 * コミットが必要になった場合はGit Data API(tree/blob/commit)への切り替えが必要）。
 */

const GITHUB_API = "https://api.github.com";

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !owner || !repo) {
    throw new Error("GitHub連携の環境変数(GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO)が未設定です");
  }
  return { token, owner, repo, branch };
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/** 対象パスの現在のSHAを取得する。ファイルが存在しない場合はnullを返す（新規作成として扱う）。 */
async function getFileSha(path: string): Promise<string | null> {
  const { token, owner, repo, branch } = getConfig();
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`,
    { headers: authHeaders(token) },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub: ファイル情報の取得に失敗しました (${res.status} ${await res.text()})`);
  }
  const data = (await res.json()) as { sha: string };
  return data.sha;
}

export type PutFileResult = { commitSha: string; commitUrl: string };

/**
 * 指定パスにファイルを作成/更新するコミットを1つ作る。
 * 既存ファイルがあれば自動的に上書き更新、無ければ新規作成になる
 * （Contents APIの仕様上、更新時は直前のshaを渡す必要があるため事前に取得する）。
 */
export async function putFile(path: string, content: string, message: string): Promise<PutFileResult> {
  const { token, owner, repo, branch } = getConfig();
  const sha = await getFileSha(path);

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub: pushに失敗しました (${res.status} ${await res.text()})`);
  }

  const data = (await res.json()) as { commit: { sha: string; html_url: string } };
  return { commitSha: data.commit.sha, commitUrl: data.commit.html_url };
}
