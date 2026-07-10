# 3125.jp — Next.js版

3125株式会社コーポレートサイトのPHP → Next.js(App Router)移行プロジェクト。
アーキテクチャ全体の設計背景は移行元リポジトリでの検討セッションを参照（Supabase/Vercel/Resend構成、CMS・AIツール拡張基盤の設計方針）。

## スタック

- Next.js 15 (App Router) / TypeScript / Tailwind CSS v4
- Supabase (Postgres / Auth / Storage)
- Resend（メール送信）/ reCAPTCHA v3
- Vercel（ホスティング・CI/CD）

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # 値を埋める（Supabase/Resend/reCAPTCHA）
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

- [x] **Phase 0** — プロジェクト基盤構築（このコミット）
- [ ] **Phase 1** — 共通レイアウト・デザイントークン・静的ページ
- [ ] **Phase 2** — Supabaseスキーマ・移行スクリプト
- [ ] **Phase 3** — Works機能
- [ ] **Phase 4** — Column機能（SEO記事）
- [ ] **Phase 5** — お問い合わせフォーム
- [ ] **Phase 6** — SEO実装（sitemap/robots/JSON-LD/OGP）
- [ ] **Phase 7** — 管理画面
- [ ] **Phase 8** — AIツール基盤
- [ ] **Phase 9** — デプロイ・本番切替

## 画像パスについて

`public/assets/images/` は旧サイト（`HP/assets/images/`）と同一のファイル名・パスで配置している。
既存の被リンク・検索エンジンのインデックスに影響を与えないため、これらのURLは変更しない。
新規にアップロードする画像のみSupabase Storageで管理する。
