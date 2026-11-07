import "server-only";
import sharp from "sharp";

const MAX_SIDE = 1600;

/**
 * Nén ảnh tải lên: xoay theo EXIF, thu cạnh dài về 1600px, xuất WebP.
 * PNG (ảnh QR, logo) giữ nét bằng WebP gần không mất dữ liệu. GIF giữ nguyên.
 * Trả về buffer và content type mới.
 */
export async function optimizeImage(input: Uint8Array, contentType: string): Promise<{ data: Uint8Array; contentType: string }> {
  if (contentType === "image/gif") return { data: input, contentType };
  const isPng = contentType === "image/png";
  const out = await sharp(input)
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .webp(isPng ? { nearLossless: true, quality: 90 } : { quality: 82, effort: 4 })
    .toBuffer();
  return { data: new Uint8Array(out), contentType: "image/webp" };
}

/** Thu nhỏ ảnh để nhúng vào ảnh xem trước (OG), trả về data URL JPEG */
export async function toDataUrl(input: Uint8Array, width: number, height: number): Promise<string> {
  const out = await sharp(input).rotate().resize({ width, height, fit: "cover", position: "attention" }).jpeg({ quality: 80 }).toBuffer();
  return `data:image/jpeg;base64,${out.toString("base64")}`;
}
