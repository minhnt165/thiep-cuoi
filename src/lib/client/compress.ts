/**
 * Nén ảnh ngay trên trình duyệt trước khi tải lên: xoay đúng chiều theo EXIF,
 * thu cạnh dài về 1600px, xuất WebP (hoặc JPEG nếu trình duyệt không hỗ trợ).
 * Ảnh điện thoại 5–8MB thường còn 200–400KB, qua được giới hạn 4,5MB của Vercel
 * và tải nhanh hơn nhiều trên 4G. Lỗi gì thì trả về file gốc.
 */
const MAX_SIDE = 1600;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const isPng = file.type === "image/png";
    const blob = await toBlob(canvas, "image/webp", isPng ? 0.95 : 0.85) ?? await toBlob(canvas, "image/jpeg", 0.85);
    if (!blob || blob.size >= file.size) return file;
    const ext = blob.type === "image/webp" ? ".webp" : ".jpg";
    return new File([blob], file.name.replace(/\.[^.]*$/, "") + ext, { type: blob.type });
  } catch {
    return file;
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b && b.type === type ? b : null), type, quality));
}
