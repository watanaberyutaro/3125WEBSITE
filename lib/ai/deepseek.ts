const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

/**
 * DeepSeek APIへの生の呼び出し。JSON構造の抽出・検証は呼び出し側の関心事
 * （process-generate/route.tsのextractJson等）であり、ここには含めない
 * — 呼び出し元によって期待するレスポンス形状が異なるため（構造化JSON vs
 * プレーンテキストのルール文）。
 */
export async function callDeepSeekChat(
  systemPrompt: string,
  userPrompt: string,
  opts?: { timeoutMs?: number },
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEYが設定されていません");

  let res: Response;
  try {
    res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(opts?.timeoutMs ?? 60_000),
    });
  } catch (e) {
    if (e instanceof Error && e.name === "TimeoutError") throw new Error("DeepSeek APIの応答がタイムアウトしました");
    throw e;
  }

  if (!res.ok) throw new Error(`DeepSeek APIがエラーを返しました (${res.status})`);

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("DeepSeek APIのレスポンス形式が想定外です");
  return content;
}
