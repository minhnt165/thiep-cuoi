# Thiệp cưới online

Tạo thiệp cưới online: chọn mẫu, điền thông tin, tải ảnh, gửi link cho khách. Khách mở thiệp trên điện thoại, xem lịch lễ, chỉ đường, album, để lại lời chúc, xác nhận tham dự và quét QR mừng cưới.

## Chạy trên máy

```bash
npm install
npm run dev
```

Mở <http://localhost:3100>. Dữ liệu ghi vào thư mục `data/` (không commit). Không cần tài khoản gì.

Lệnh khác: `npm test` (lịch âm, ngày tháng), `npm run typecheck`, `npm run lint`, `npm run build`.

## Cấu trúc

| Thư mục | Nội dung |
| --- | --- |
| `src/lib/schema.ts` | Mô hình dữ liệu một thiệp (zod). Nội dung tách khỏi mẫu: đổi mẫu không mất dữ liệu. |
| `src/lib/templates/` | Bốn mẫu: token màu, chữ, chất liệu nền, họa tiết, kiểu bìa. |
| `src/lib/lunar.ts` | Đổi dương lịch sang âm lịch (thuật toán Hồ Ngọc Đức), tên can chi. |
| `src/lib/store/` | Lớp lưu trữ: `file-store` (mặc định) và `supabase-store`. Chọn bằng `STORE`. |
| `src/components/invitation/` | Thiệp cho khách xem: bìa, các phần, slideshow, CSS. |
| `src/components/ornaments/` | Họa tiết SVG vẽ tay và chất liệu nền (feTurbulence). |
| `src/components/editor/` | Trình chỉnh sửa: form theo tab + xem trước trong khung điện thoại. |
| `src/app/[slug]` | Trang thiệp công khai. `/demo/[template]` xem thử mẫu với dữ liệu giả. |
| `src/app/api/` | Tạo/lưu thiệp, lời chúc, RSVP, tải file. |

## Luồng dùng

1. Trang chủ → **Tạo thiệp** (chọn đường dẫn + mẫu) → chuyển sang `/edit/<slug>`.
2. Trình chỉnh sửa lưu **khóa sửa** vào trình duyệt. Tab **Chia sẻ** có link chỉnh sửa kèm khóa để mở trên máy khác.
3. Bấm **Lưu** (hoặc Ctrl+S) → link `/<slug>` cập nhật ngay.
4. Tab **Khách** xem ai đã xác nhận và lời chúc.

## Đưa lên mạng (Vercel + Supabase)

1. Tạo project Supabase, chạy `supabase/migrations/0001_init.sql` trong SQL editor.
2. Đặt biến môi trường: `STORE=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
3. Deploy lên Vercel. Bản Supabase đã chạy thử đủ luồng (tạo thiệp, lời chúc, RSVP, tải ảnh, ảnh OG).

## Tính năng đáng chú ý

- **Ảnh tải lên được nén** (xoay theo EXIF, cạnh dài 1600px, WebP) bằng `sharp` trong `src/lib/images.ts`.
- **Ảnh xem trước khi gửi link** (Zalo, Messenger, Facebook): `src/app/[slug]/opengraph-image.tsx` sinh ảnh 1200×630 theo màu mẫu, có ảnh cưới nếu đã tải. Font trong `src/assets/fonts/`.
- **Link riêng từng khách**: `/<slug>?to=Tên` hiện "Thân mời Tên" trên bìa và điền sẵn tên ở xác nhận. Tab Khách tạo link hàng loạt.
- **QR mừng cưới tự sinh** chuẩn VietQR từ ngân hàng + số tài khoản (`src/lib/banks.ts`); vẫn tải ảnh QR riêng được.
- Favicon theo màu mẫu của từng thiệp; `scripts/make-icons.py` sinh bộ icon.
- **8 mẫu, mỗi mẫu một ngôn ngữ riêng** (`src/lib/templates/index.ts` + phần "điều chỉnh theo mẫu" trong `invitation.css`): cẩm thạch vàng, đỏ rượu phong bì, Song Hỷ, hoa trắng polaroid, xanh sage toàn vòm, xanh đêm sao art-deco (nền tối), hồng phấn màu nước, tối giản kiểu tạp chí. Họa tiết lớn rải dọc hai mép trang (`SideArt`).
- **Mở thiệp**: mẫu nào cũng mở ra màn ảnh bìa tràn màn hình, tên phủ trên ảnh, ảnh trôi chậm khi cuộn. Bốn mẫu (cẩm thạch vàng, Song Hỷ, xanh đêm sao, tối giản) dùng bìa hai cánh cửa tách ra; bốn mẫu còn lại giữ bìa riêng. Khung chung ở `opening.css` (bìa cửa, màn ảnh) và `interior.css` (khối lễ cưới, thẻ địa điểm); `marble-gold.css` là phần riêng của mẫu cẩm thạch vàng.
- **Chỉ đường từng lễ**: tiệc chính và các lễ được gom theo địa điểm, mỗi nơi một map (tối đa 3).
- **Ảnh ngang trong album**: thẻ tự chuyển sang khung ngang, phần hở nhỏ lót bằng chính ảnh đó làm mờ.
- **Ảnh demo** trong `public/demo/` lấy từ Unsplash (nguồn ghi ở `public/demo/CREDITS.md`), chỉ trang demo dùng; thiệp mới tạo để trống ảnh.
- **Mời tác giả cốc cà phê** ở cuối trang chủ: đặt `DONATE_BANK_CODE`, `DONATE_ACCOUNT`, `DONATE_HOLDER` (xem `.env.example`), thiếu thì khối tự ẩn.
- **Nhạc nền có sẵn**: danh sách trong `src/lib/music.ts`, file MP3 tự đặt vào `public/music/` (không kèm trong repo vì bản quyền).
- Ảnh mẫu trên trang chủ là ảnh chụp bìa thật: `node scripts/shoot-templates.mjs` (cần dev server + playwright).

## Chưa làm (giai đoạn sau)

- Tài khoản người dùng, nhiều người cùng dùng, thanh toán.
- Xuất video/ảnh thiệp.
- Hình họa tiết chất lượng cao hơn (mua bản quyền hoặc vẽ tay).
