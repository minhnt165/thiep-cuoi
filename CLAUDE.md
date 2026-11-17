# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Thiệp cưới online (Next.js 16 App Router, React 19, zod, Supabase tùy chọn). Toàn bộ chữ trên giao diện, comment và commit message viết bằng tiếng Việt.

## Lệnh

```bash
npm run dev          # http://localhost:3100 (predev tự sinh src/lib/music-files.json từ public/music)
npm run build
npm run typecheck    # next typegen && tsc --noEmit — cần typegen trước để có kiểu route
npm run lint
npm test             # vitest run
npx vitest run src/lib/money.test.ts        # một file test
npx vitest run -t "đọc đơn vị viết tắt"     # một ca test theo tên
```

Thử luồng đăng nhập trên máy không cần Google: `npx cross-env AUTH=dev npm run dev` (đăng nhập bằng cách gõ email). Chế độ này dùng chung `data/`, nên "Nhận thiệp" sẽ gắn thiệp thật trên máy vào email đã gõ; muốn tách thì đặt thêm `DATA_DIR`.

## Next.js 16

Theo `AGENTS.md`: bản này khác dữ liệu huấn luyện, đọc `node_modules/next/dist/docs/` trước khi dùng API Next. Trong repo: `params` của page và route handler là `Promise` (phải `await params`). Không có middleware: xác thực nằm trong từng route handler.

## Kiến trúc

**Dữ liệu một thiệp** (`src/lib/schema.ts`, zod): nội dung tách khỏi mẫu, đổi `template` chỉ đổi giao diện. Store đọc bằng `safeParse` và **trả `null` nếu JSON cũ không qua schema**, nên thêm trường mới luôn kèm `.default(...)`, không thì thiệp cũ "biến mất". `toPublic()` bỏ `editKey`, `guests`, `members` trước khi gửi cho khách; dữ liệu riêng tư mới cũng phải bỏ ở đây.

**Lưu trữ** (`src/lib/store/`): `getStore()` chọn theo `STORE` — `file-store` (mặc định, JSON trong `data/` hoặc `DATA_DIR`) hoặc `supabase-store` (bảng jsonb + bucket `uploads`). Thêm loại dữ liệu mới thì phải sửa cả `types.ts`, cả hai store, và thêm migration đánh số tiếp theo trong `supabase/migrations/`. Store và `src/lib/auth.ts` là `server-only`.

**Ba loại bản ghi:** thiệp (`invitations`), lời chúc/RSVP (`wishes`, `rsvps`, khách gửi công khai), và sổ kế hoạch (`plans`, `src/lib/plan.ts`: công việc, chi phí, tiền mừng). Danh sách khách (`guests`) và người quản lý (`members`) nằm trong thiệp nhưng chỉ sửa qua `/guests` và `/members`; `PUT /api/invitations/[slug]` cố ý giữ nguyên hai trường này để trình chỉnh sửa mở từ trước không ghi đè.

**Xác thực** (`src/lib/auth.ts`): `authMode()` trả `off` (chỉ khóa sửa), `supabase` (đăng nhập Google; bật khi `STORE=supabase` và có `NEXT_PUBLIC_SUPABASE_ANON_KEY`), hoặc `dev`. `requireEditor()` là cổng cho mọi API ghi:
- Chế độ `off`: header `x-edit-key` khớp là được.
- Có đăng nhập: thành viên vào được. Thiệp chưa có thành viên thì dùng khóa sửa khi chưa đăng nhập, còn đã đăng nhập thì trả code `claim`.

Lỗi trả `{ error, code }`. Client (`src/lib/client/api.ts`) gửi kèm khóa và `Authorization: Bearer` qua `authHeaders()`, ném `ApiError` có `code`. Editor/Planner dựa vào `code` (`login`, `claim`, `not_member`, `key`) để hiện màn tương ứng trong `src/components/auth/`.

**Trang của chủ thiệp** (`/edit/[slug]`, `/plan/[slug]`): page server chỉ đọc `authMode()` rồi truyền xuống loader `dynamic(..., { ssr: false })`, vì cần localStorage (khóa sửa, phiên đăng nhập). Khóa sửa nhớ theo slug trong `src/lib/client/edit-key.ts`; `?key=` trên URL được nhớ rồi xóa khỏi thanh địa chỉ. Trình chỉnh sửa lưu tay (nút Lưu / Ctrl+S); trang Quản lý cưới tự lưu sau 0,8 giây, các lần lưu xếp hàng trong một promise.

**Mẫu thiệp** (`src/lib/templates/index.ts`): mỗi mẫu là bộ token (màu, font, chất liệu, họa tiết, kiểu bìa). `themeVars()` biến token thành CSS variables đặt lên gốc thiệp. Chỉnh riêng từng mẫu bằng class `t-<id>` trong `src/components/invitation/*.css`. Trang Quản lý cưới cũng dùng `themeVars()` để lấy màu và họa tiết theo mẫu. Ảnh mẫu trên trang chủ là ảnh chụp thật; khi đổi bìa thì chạy `node scripts/shoot-templates.mjs` (cần dev server) và tăng `SHOT_VERSION` trong `src/lib/template-shots.ts`.

**Ngày giờ:** mọi ngày lưu dạng `YYYY-MM-DD`, hiểu theo giờ Việt Nam. Dùng helper trong `src/lib/dates.ts` / `plan.ts` (`toVnDate`, `vnToday`, `addDays` tính bằng UTC), không dùng `new Date("YYYY-MM-DD")` trần. Âm lịch ở `src/lib/lunar.ts`. Chọn ngày dùng `src/components/DatePicker.tsx` (dd/mm/yyyy, có ngày âm), không dùng `<input type="date">`.

**Tải ảnh:** ảnh nén trên trình duyệt (`src/lib/client/compress.ts`) rồi nén lại ở server bằng `sharp` (`src/lib/images.ts`). Với Supabase, server cấp link ký sẵn để trình duyệt tải thẳng lên Storage, tránh giới hạn 4,5MB của Vercel.

## Giao diện

Không dùng thư viện UI. Token chung `--ui-*` ở `src/app/globals.css`; mỗi khu một file CSS thuần với tiền tố riêng: `ed-` (trình chỉnh sửa), `pl-` (Quản lý cưới), `dp-` (lịch), `au-` (đăng nhập). Phần tử nổi phải thoát khỏi khối có `container-type` hoặc `overflow` (ví dụ lịch dùng `createPortal` vào `body`). Hai màu nhà trai / nhà gái (`--pl-groom` `#2a78d6`, `--pl-bride` `#eb6834`) đã kiểm tra mù màu, và luôn đi kèm chữ ghi bên.

## Đưa lên mạng

Vercel + Supabase: chạy lần lượt các file trong `supabase/migrations/`, đặt biến theo `.env.example`. Các bước bật Google OAuth ghi trong `README.md`. `CREATE_CODE` chặn tạo thiệp rác. Danh sách mọi thiệp chỉ hiện khi chạy trên máy (`STORE` khác `supabase`).
