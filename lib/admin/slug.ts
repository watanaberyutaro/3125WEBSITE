/**
 * タイトル等からURLスラッグ候補を生成する。ASCII英数字以外は捨てる。
 * revalidatePath()等のNext.js内部処理は非ASCII文字を含むパスをHeaders相当の
 * 値として扱えずクラッシュするため、日本語のみの入力は乱数スラッグにフォールバックする。
 */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || crypto.randomUUID().slice(0, 8)
  );
}
