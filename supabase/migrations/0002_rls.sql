-- RLS方針:
-- 公開データ(works/articles/categories/tags)は匿名でも読める。書き込みはstaff(profilesに行がある)のみ。
-- inquiries/tool_leadsはRLSを有効化した上でポリシーを一切作らない(staffのSELECTのみ許可)。
-- 匿名からのINSERTは常にRoute Handler経由・service role keyで行うため、
-- anon key向けのINSERTポリシーは意図的に作らない。

-- security definerで実行することで、これらの関数内のprofiles参照はRLSを
-- バイパスする。ポリシー本体からprofilesを直接サブクエリすると自己参照で
-- 無限再帰になるため、必ずこの関数経由でチェックすること。
create or replace function is_staff()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid());
$$ language sql stable security definer set search_path = public;

create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql stable security definer set search_path = public;

-- ── works ──
alter table works enable row level security;

create policy "public can read published works"
  on works for select
  using (status = 'published');

create policy "staff can read all works"
  on works for select
  using (is_staff());

create policy "staff can insert works"
  on works for insert
  with check (is_staff());

create policy "staff can update works"
  on works for update
  using (is_staff());

create policy "staff can delete works"
  on works for delete
  using (is_staff());

-- ── articles ──
alter table articles enable row level security;

create policy "public can read published articles"
  on articles for select
  using (status = 'published');

create policy "staff can read all articles"
  on articles for select
  using (is_staff());

create policy "staff can insert articles"
  on articles for insert
  with check (is_staff());

create policy "staff can update articles"
  on articles for update
  using (is_staff());

create policy "staff can delete articles"
  on articles for delete
  using (is_staff());

-- ── article_tags（記事に準じる） ──
alter table article_tags enable row level security;

create policy "public can read article_tags"
  on article_tags for select
  using (true);

create policy "staff can manage article_tags"
  on article_tags for all
  using (is_staff())
  with check (is_staff());

-- ── categories / tags：公開読み取り、書き込みはstaffのみ ──
alter table categories enable row level security;

create policy "public can read categories"
  on categories for select
  using (true);

create policy "staff can manage categories"
  on categories for all
  using (is_staff())
  with check (is_staff());

alter table tags enable row level security;

create policy "public can read tags"
  on tags for select
  using (true);

create policy "staff can manage tags"
  on tags for all
  using (is_staff())
  with check (is_staff());

-- ── inquiries：staffのSELECTのみ。INSERTはservice role経由(RLSバイパス)のみ許可 ──
alter table inquiries enable row level security;

create policy "staff can read inquiries"
  on inquiries for select
  using (is_staff());

create policy "staff can update inquiries"
  on inquiries for update
  using (is_staff());

-- ── tool_leads：同様にstaffのSELECTのみ ──
alter table tool_leads enable row level security;

create policy "staff can read tool_leads"
  on tool_leads for select
  using (is_staff());

-- ── redirects：middleware(anon key)から読み取るため公開SELECT許可。書き込みはstaffのみ ──
alter table redirects enable row level security;

create policy "public can read redirects"
  on redirects for select
  using (true);

create policy "staff can manage redirects"
  on redirects for all
  using (is_staff())
  with check (is_staff());

-- ── profiles：本人と他staffが読める。書き込みはadminロールのみ ──
alter table profiles enable row level security;

create policy "staff can read profiles"
  on profiles for select
  using (is_staff());

create policy "admin can manage profiles"
  on profiles for all
  using (is_admin())
  with check (is_admin());
