/**
 * Ảnh chụp bìa thật của từng mẫu, sinh bằng `node scripts/shoot-templates.mjs` (840×1280),
 * dùng ở trang chủ và ô chọn mẫu của trình chỉnh sửa. Tăng SHOT_VERSION mỗi lần chụp lại
 * để trình duyệt và CDN không giữ ảnh cũ.
 */
export const SHOT_VERSION = 4;

export const templateShot = (id: string) => `/templates/${id}.webp?v=${SHOT_VERSION}`;
