# 3125.jp — Next.js版

3125株式会社コーポレートサイトのPHP → Next.js(App Router)移行プロジェクト。
アーキテクチャ全体の設計背景は移行元リポジトリでの検討セッションを参照
（Supabase/Vercel構成、CMS・AIツール拡張基盤の設計方針。メール送信は
外部サービスを使わず既存PHPホスティングを使い続ける方針に変更済み）。

## スタック

- Next.js 15 (App Router) / TypeScript / Tailwind CSS v4
- Supabase (Postgres / Auth / Storage)
- 既存PHPホスティング（メール送信専用ブリッジ）/ reCAPTCHA v3
- Vercel（ホスティング・CI/CD）

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # 値を埋める（Supabase/メールブリッジ/reCAPTCHA）
npm run dev
```

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | ローカル開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:types` | Supabaseスキーマから型を再生成（`SUPABASE_PROJECT_ID`環境変数が必要） |
| `npm run migrate:from-php` | 旧PHPサイトの`works.json`/`news.json`をSupabaseへ移行（Phase 2で使用） |

## 実装フェーズ

このプロジェクトはフェーズごとに実装している。各フェーズの詳細はコミット履歴・タスクリストを参照。

- [x] **Phase 0** — プロジェクト基盤構築
- [x] **Phase 1** — 共通レイアウト・デザイントークン・静的ページ（About/Company/Services/Contact/Home）
- [x] **Phase 2** — Supabaseスキーマ・移行スクリプト（本番Supabaseプロジェクトに適用済み、works 7件・articles 1件を移行済み）
- [x] **Phase 3** — Works機能（一覧・詳細・カテゴリ/業種別ページ・検索、Home画面の実績カルーセル）
- [x] **Phase 4** — Column機能（記事一覧・詳細・目次自動生成・タグ・関連記事・FAQ・RSS、Home画面のお知らせ抜粋）
- [x] **Phase 5** — お問い合わせフォーム（`/api/contact` + PHPメールブリッジ + reCAPTCHA v3 + Supabase保存。要reCAPTCHAキー設定、下記参照）
- [x] **Phase 6** — SEO実装（動的sitemap.xml/robots.txt/manifest、共通metadataヘルパーでcanonical・OGP・Twitter Cardを全ページ統一、Breadcrumb JSON-LDを主要ページへ追加）
- [ ] **Phase 7** — 管理画面
- [ ] **Phase 8** — AIツール基盤
- [ ] **Phase 9** — デプロイ・本番切替

## 画像パスについて

`public/assets/images/` は旧サイト（`HP/assets/images/`）と同一のファイル名・パスで配置している。
既存の被リンク・検索エンジンのインデックスに影響を与えないため、これらのURLは変更しない。
新規にアップロードする画像のみSupabase Storageで管理する。

## Supabase運用

- テーブル定義は `supabase/migrations/*.sql` が正（スキーマ変更は必ずここに新しいマイグレーションファイルを追加する形で行う）。
- ローカルから本番プロジェクトへ適用する場合:
  ```bash
  export SUPABASE_ACCESS_TOKEN=<Personal Access Token>  # supabase.com/dashboard/account/tokens
  supabase link --project-ref sywbfehsfzdqcfkxohga
  supabase db push
  npm run db:types   # 型を再生成
  ```
- `categories` は `kind` 列（`work_category` / `work_industry` / `article_category`）でwork/article共通のタクソノミーを1テーブルにまとめている。
- `inquiries` / `tool_leads` は匿名からの読み書きを一切許可していない（RLSは有効だがポリシー無し）。書き込みは必ずRoute Handlerがservice role keyで行う。

## お問い合わせフォームの有効化・メール送信の仕組み

外部メール配信サービス（Resend等）は使わず、既存PHPホスティングの
`mb_send_mail()` をそのまま使い続ける方針。構成は以下の通り:

```
ブラウザ → Next.js /api/contact（バリデーション・reCAPTCHA検証・Supabase保存）
        → HP/api/send-mail.php（サーバー間通信・メール送信のみ担当）
        → mb_send_mail()
```

**本番へのデプロイ手順:**
1. `HP/api/send-mail.php` を既存PHPホスティングへアップロード（他のPHP修正と同様、FTP等で）
2. `.env.local`（およびVercelの環境変数）に以下を設定:
   - `MAIL_BRIDGE_URL` — 例: `https://3125.jp/api/send-mail.php`
     ⚠️ **Phase 9で本番ドメインをVercelへ切り替えると、`3125.jp` はNext.js側を
     指すようになりこのURLが壊れる。** 切替前に、PHPホスティング専用の
     サブドメイン（例: `legacy-mail.3125.jp`）等、ドメイン切替の影響を受けない
     安定したURLに変更しておくこと。
   - `MAIL_BRIDGE_SECRET` — `HP/api/send-mail.php` 内の `MAIL_BRIDGE_SECRET`
     定数と同じ文字列にする（サーバー間通信の認証用共有シークレット）。
3. `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` — https://www.google.com/recaptcha/admin
   でv3のサイトを登録して発行。未設定の場合はreCAPTCHA検証自体をスキップする
   （開発中にフォームが使えなくならないための措置。本番運用前に必ず設定すること）。

問い合わせ内容はメール送信の成否に関わらず必ずSupabaseの`inquiries`に保存されるため、
メールブリッジが一時的に落ちてもリード自体は失われない。

## SEO実装メモ

- `app/sitemap.ts` — 静的ページ＋公開中のworks/articles＋カテゴリ/業種/タグページを動的生成。下書き(status=draft)は含まれない。
- `app/robots.ts` — `/admin`・`/api`をdisallow、sitemap.xmlを明記。
- `lib/seo/metadata.ts` — 全ページ共通のmetadata生成ヘルパー。canonical・OGP・Twitter Card（画像を明示指定）を1箇所から一貫して出力する。
- `components/seo/Breadcrumb.tsx` — 表示とBreadcrumbList JSON-LDを同一データソースから生成（About/Company/Services/Contact/Works/Column の一覧・詳細・カテゴリ・業種・タグページに設置済み）。
- OGP画像は「実際のカバー画像 → 無ければ `/assets/images/ogp.jpg` の静的フォールバック」という方針。動的OG画像生成(next/og)は、日本語タイトルをレンダリングするには追加のCJKフォント読み込みが必要でedge実行時の安定性リスクがあるため、今回は見送った。

## 将来対応: 記事の自動生成

全フェーズ完了後、`articles` テーブルへ毎日自動で記事を投稿する機能を追加予定。
`status`(draft/published)・`category_id`・`tags`・`faq` など、CMS想定のカラムは既に揃っているため、
実装時はservice role keyでinsertするジョブ（Vercel Cron等）を追加するだけで対応できる設計にしてある。
