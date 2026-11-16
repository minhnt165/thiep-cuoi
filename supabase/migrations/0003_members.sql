-- Người quản lý thiệp nằm trong data->'members' (email tài khoản Google).
-- Chỉ mục GIN để tìm "thiệp của tôi" bằng data @> '{"members":[{"email":"..."}]}' cho nhanh.
create index if not exists invitations_data_gin on public.invitations using gin (data jsonb_path_ops);
