-- Sổ kế hoạch cưới (công việc, chi phí, tiền mừng) của từng thiệp.
-- Chỉ chủ thiệp xem qua API có khóa sửa, nên cũng khóa với anon như các bảng khác.

create table if not exists public.plans (
  slug text primary key references public.invitations(slug) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.plans enable row level security;
