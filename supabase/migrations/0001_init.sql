-- Chạy trong SQL editor của Supabase (hoặc `supabase db push`).
-- Dữ liệu giữ nguyên dạng JSON của app để đổi schema không phải migrate.

create table if not exists public.invitations (
  slug text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.wishes (
  id text primary key,
  slug text not null references public.invitations(slug) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists wishes_slug_idx on public.wishes(slug, created_at desc);

create table if not exists public.rsvps (
  id text primary key,
  slug text not null references public.invitations(slug) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists rsvps_slug_idx on public.rsvps(slug, created_at desc);

-- App chỉ truy cập bằng service role ở server, nên khóa hết với anon.
alter table public.invitations enable row level security;
alter table public.wishes enable row level security;
alter table public.rsvps enable row level security;

-- Bucket ảnh/nhạc, đọc công khai, ghi qua service role.
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;
