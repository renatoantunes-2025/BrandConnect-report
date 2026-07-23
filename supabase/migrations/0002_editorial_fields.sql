-- Campos editoriais preenchidos pela operadora, além dos dados brutos do export.

alter table posts
  add column if not exists format text,
  add column if not exists product_theme text,
  add column if not exists category text,
  add column if not exists is_repost boolean not null default false,
  add column if not exists profile_visits integer,
  add column if not exists link_clicks integer,
  add column if not exists notes text;

-- Backfill do Formato pros posts que já existem, a partir do "Tipo de post" do CSV.
update posts
set format = trim(regexp_replace(post_type, ' do (Instagram|Facebook)$', '', 'i'))
where format is null and post_type is not null;
