/**
 * 旧PHPサイト（HP/data/works.json, HP/data/news.json）をSupabaseへ一括移行する。
 * 一度きりのローカル実行用スクリプトのため、移行元パスは絶対パスで直接参照する。
 *
 * 実行:
 *   npm run migrate:from-php
 *
 * べき等性: 同じslugのレコードは upsert するため、複数回実行しても重複しない。
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です。.env.local を確認してください。",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const HP_ROOT = "/Users/watanaberyuutarou/myProject/HP";

type LegacyWork = {
  id: string;
  num: number;
  category: string;
  year: string;
  title: string;
  industry: string;
  description: string;
  link: string;
  image: string;
  created_at: string;
  updated_at?: string;
};

type LegacyNews = {
  id: string;
  type: string;
  date: string;
  title: string;
  body?: string;
  link?: string;
  image?: string;
  created_at: string;
  updated_at?: string;
};

const INDUSTRY_SLUG_MAP: Record<string, string> = {
  "非営利・公益財団": "nonprofit-public",
  "サービス業": "service-industry",
  "ウェディング": "wedding",
  "不動産テック": "real-estate-tech",
  "IT・テクノロジー": "it-technology",
  "HRテック・転職支援": "hr-tech-career",
};

async function getCategoryId(kind: string, slug: string): Promise<string> {
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("kind", kind)
    .eq("slug", slug)
    .single();
  if (error || !data) {
    throw new Error(`カテゴリが見つかりません: kind=${kind} slug=${slug} (${error?.message})`);
  }
  return data.id;
}

async function upsertRedirect(fromPath: string, toPath: string) {
  const { error } = await supabase
    .from("redirects")
    .upsert({ from_path: fromPath, to_path: toPath }, { onConflict: "from_path" });
  if (error) throw new Error(`redirect upsert失敗 (${fromPath}): ${error.message}`);
}

async function migrateWorks() {
  const raw = readFileSync(`${HP_ROOT}/data/works.json`, "utf-8");
  const works: LegacyWork[] = JSON.parse(raw);

  console.log(`\n=== works.json: ${works.length}件 ===`);

  for (const w of works) {
    const [clientName, projectName] = w.title.split("\n");
    const legacyNum = String(w.num).padStart(2, "0");
    const slug = `work-${legacyNum}`;

    const categoryId = await getCategoryId("work_category", w.category);
    const industrySlug = INDUSTRY_SLUG_MAP[w.industry];
    if (!industrySlug) {
      throw new Error(`業種のslugマッピングが未定義です: "${w.industry}"（scripts/migrate-from-php.tsのINDUSTRY_SLUG_MAPに追加してください）`);
    }
    const industryId = await getCategoryId("work_industry", industrySlug);

    const { error } = await supabase.from("works").upsert(
      {
        slug,
        client_name: clientName ?? w.title,
        project_name: projectName ?? "",
        category_id: categoryId,
        industry_id: industryId,
        year: w.year,
        description: w.description || null,
        external_link: null, // 新サイトでは /works/[slug] 自体が詳細ページになる
        cover_image_path: `/${w.image}`, // public/assets/images配下、URL不変
        status: "published",
        sort_order: w.num,
        published_at: w.created_at,
      },
      { onConflict: "slug" },
    );
    if (error) throw new Error(`works upsert失敗 (${slug}): ${error.message}`);
    console.log(`  ✓ ${slug} — ${clientName} ${projectName ?? ""}`);

    // 旧URL → 新URL のリダイレクトを記録
    await upsertRedirect(`/work-${legacyNum}.html`, `/works/${slug}`);
    await upsertRedirect(`/work-detail.php?id=${w.id}`, `/works/${slug}`);
  }
}

async function uploadNewsImage(localRelPath: string, destName: string): Promise<string | null> {
  const localPath = `${HP_ROOT}/${localRelPath}`;
  let buffer: Buffer;
  try {
    buffer = readFileSync(localPath);
  } catch {
    console.warn(`  ! 画像ファイルが見つかりません（スキップ）: ${localPath}`);
    return null;
  }
  const ext = destName.split(".").pop() ?? "png";
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  const { error } = await supabase.storage
    .from("article-images")
    .upload(destName, buffer, { contentType, upsert: true });
  if (error) throw new Error(`Storageアップロード失敗 (${destName}): ${error.message}`);

  const { data } = supabase.storage.from("article-images").getPublicUrl(destName);
  return data.publicUrl;
}

function slugifyNewsTitle(title: string): string {
  // 現行データは1件のみのため簡易マッピング。Phase 4以降はCMS側で編集可能にする。
  if (title.includes("リニューアル")) return "hp-renewal-announcement";
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "article";
}

async function migrateNews() {
  const raw = readFileSync(`${HP_ROOT}/data/news.json`, "utf-8");
  const news: LegacyNews[] = JSON.parse(raw);

  console.log(`\n=== news.json: ${news.length}件 ===`);

  for (const n of news) {
    const slug = slugifyNewsTitle(n.title);
    const categoryId = await getCategoryId("article_category", n.type);

    let coverImagePath: string | null = null;
    if (n.image) {
      const destName = n.image.split("/").pop() ?? `${n.id}.png`;
      coverImagePath = await uploadNewsImage(n.image, destName);
    }

    const { error } = await supabase.from("articles").upsert(
      {
        slug,
        title: n.title,
        body_markdown: n.body ?? "",
        category_id: categoryId,
        cover_image_path: coverImagePath,
        source_link: n.link ?? null,
        status: "published",
        published_at: `${n.date}T00:00:00+09:00`,
      },
      { onConflict: "slug" },
    );
    if (error) throw new Error(`articles upsert失敗 (${slug}): ${error.message}`);
    console.log(`  ✓ ${slug} — ${n.title}`);

    await upsertRedirect(`/news-detail.php?id=${n.id}`, `/column/${slug}`);
  }
}

async function main() {
  await migrateWorks();
  await migrateNews();
  console.log("\n移行完了。");
}

main().catch((err) => {
  console.error("\n移行失敗:", err.message ?? err);
  process.exit(1);
});
