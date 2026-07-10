-- work-detail.php(旧)は「Category」欄にタクソノミー名とは異なる案件個別の
-- 表示ラベル（例: work-07のみ「Webサービス開発」）を使っていたため、
-- categories.name とは別に上書き用のラベルを持たせる。未設定時はcategories.nameを使う。
alter table works
  add column category_label text;
