import type { Invitation, Rsvp, Wish } from "@/lib/schema";
import { compressImage } from "./compress";

/** Gọi API từ trình chỉnh sửa, luôn kèm khóa sửa */
function headers(key: string, json = true): HeadersInit {
  return json ? { "content-type": "application/json", "x-edit-key": key } : { "x-edit-key": key };
}

async function unwrap<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body as { error?: string }).error;
    if (res.status === 413) throw new Error("File quá lớn, server không nhận. Thử ảnh nhỏ hơn hoặc nhạc ngắn hơn.");
    throw new Error(msg ?? `Lỗi ${res.status}`);
  }
  return body as T;
}

/**
 * Tải file lên. Ảnh được nén trên trình duyệt trước. Nếu server cấp link ký sẵn
 * (Supabase) thì tải thẳng lên Storage, không đi qua Vercel (giới hạn 4,5MB);
 * không thì gửi qua API upload như bình thường (chạy trên máy cá nhân).
 */
async function upload(slug: string, key: string, original: File): Promise<string> {
  const file = await compressImage(original);
  const signed = await fetch(`/api/invitations/${slug}/upload-url`, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size }),
  }).then((r) => unwrap<{ uploadUrl: string | null; publicUrl?: string }>(r));

  if (signed.uploadUrl && signed.publicUrl) {
    const put = await fetch(signed.uploadUrl, { method: "PUT", headers: { "content-type": file.type, "x-upsert": "false" }, body: file });
    if (!put.ok) throw new Error(`Tải lên Storage lỗi ${put.status}`);
    return signed.publicUrl;
  }

  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`/api/invitations/${slug}/upload`, { method: "POST", headers: headers(key, false), body: fd });
  return (await unwrap<{ url: string }>(r)).url;
}

export const api = {
  load: (slug: string, key: string) => fetch(`/api/invitations/${slug}`, { headers: headers(key, false), cache: "no-store" }).then((r) => unwrap<Invitation>(r)),
  save: (inv: Invitation, key: string) => fetch(`/api/invitations/${inv.slug}`, { method: "PUT", headers: headers(key), body: JSON.stringify(inv) }).then((r) => unwrap<Invitation>(r)),
  rsvps: (slug: string, key: string) => fetch(`/api/invitations/${slug}/rsvp`, { headers: headers(key, false), cache: "no-store" }).then((r) => unwrap<Rsvp[]>(r)),
  wishes: (slug: string) => fetch(`/api/invitations/${slug}/wishes`, { cache: "no-store" }).then((r) => unwrap<Wish[]>(r)),
  upload,
};
