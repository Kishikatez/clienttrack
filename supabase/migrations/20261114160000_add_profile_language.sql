alter table public.profiles
  add column if not exists lang text not null default 'en'
  check (lang in ('en', 'ar'));
