-- Storageバケット: works-images / article-images / og-images
-- いずれも公開読み取り可・書き込みはstaffのみ。

insert into storage.buckets (id, name, public)
values
  ('works-images', 'works-images', true),
  ('article-images', 'article-images', true),
  ('og-images', 'og-images', true)
on conflict (id) do nothing;

create policy "public can read works-images"
  on storage.objects for select
  using (bucket_id = 'works-images');

create policy "staff can write works-images"
  on storage.objects for insert
  with check (bucket_id = 'works-images' and is_staff());

create policy "staff can update works-images"
  on storage.objects for update
  using (bucket_id = 'works-images' and is_staff());

create policy "staff can delete works-images"
  on storage.objects for delete
  using (bucket_id = 'works-images' and is_staff());

create policy "public can read article-images"
  on storage.objects for select
  using (bucket_id = 'article-images');

create policy "staff can write article-images"
  on storage.objects for insert
  with check (bucket_id = 'article-images' and is_staff());

create policy "staff can update article-images"
  on storage.objects for update
  using (bucket_id = 'article-images' and is_staff());

create policy "staff can delete article-images"
  on storage.objects for delete
  using (bucket_id = 'article-images' and is_staff());

create policy "public can read og-images"
  on storage.objects for select
  using (bucket_id = 'og-images');

create policy "staff can write og-images"
  on storage.objects for insert
  with check (bucket_id = 'og-images' and is_staff());

create policy "staff can update og-images"
  on storage.objects for update
  using (bucket_id = 'og-images' and is_staff());

create policy "staff can delete og-images"
  on storage.objects for delete
  using (bucket_id = 'og-images' and is_staff());
