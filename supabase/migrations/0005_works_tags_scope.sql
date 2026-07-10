-- work-detail.php(旧)が持っていた Tags / Scope フィールドをworksへ追加。
alter table works
  add column tags text[] not null default '{}',
  add column scope text;
