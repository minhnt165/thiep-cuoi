import type { Guest, Invitation, Rsvp, Wish } from "@/lib/schema";
import type { Plan } from "@/lib/plan";
import type { Member } from "@/lib/members";
import { compressImage } from "./compress";
import { accessToken } from "./auth";

/**
 * Gọi API từ trình chỉnh sửa / trang quản lý: kèm khóa sửa (nếu có) và
 * token đăng nhập (nếu đang bật đăng nhập). Token lấy lại mỗi lần gọi vì tự làm mới.
 */
export async function authHeaders(key = "", json = true): Promise<Record<string, string>> {
  const h: Record<string, string> = {};
  if (json) h["content-type"] = "application/json";
  if (key) h["x-edit-key"] = key;
  const token = await accessToken();
  if (token) h.authorization = `Bearer ${token}`;
  return h;
}
const headers = authHeaders;

/** Lỗi từ API, kèm `code` (login, claim, not_member, key…) để giao diện biết hiện màn nào */
export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code = "") {
    super(message);
  }
}

async function unwrap<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const { error, code } = body as { error?: string; code?: string };
    if (res.status === 413) throw new ApiError("File quá lớn, server không nhận. Thử ảnh nhỏ hơn hoặc nhạc ngắn hơn.", 413);
    throw new ApiError(error ?? `Lỗi ${res.status}`, res.status, code);
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
    headers: await headers(key),
    body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size }),
  }).then((r) => unwrap<{ uploadUrl: string | null; publicUrl?: string }>(r));

  if (signed.uploadUrl && signed.publicUrl) {
    const put = await fetch(signed.uploadUrl, { method: "PUT", headers: { "content-type": file.type, "x-upsert": "false" }, body: file });
    if (!put.ok) throw new Error(`Tải lên Storage lỗi ${put.status}`);
    return signed.publicUrl;
  }

  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`/api/invitations/${slug}/upload`, { method: "POST", headers: await headers(key, false), body: fd });
  return (await unwrap<{ url: string }>(r)).url;
}

type InvitationSummary = Pick<Invitation, "slug" | "template" | "groom" | "bride" | "mainEvent" | "updatedAt">;
type Members = { members: Member[]; me: string };

export const api = {
  load: async (slug: string, key: string) => unwrap<Invitation>(await fetch(`/api/invitations/${slug}`, { headers: await headers(key, false), cache: "no-store" })),
  save: async (inv: Invitation, key: string) => unwrap<Invitation>(await fetch(`/api/invitations/${inv.slug}`, { method: "PUT", headers: await headers(key), body: JSON.stringify(inv) })),
  rsvps: async (slug: string, key: string) => unwrap<Rsvp[]>(await fetch(`/api/invitations/${slug}/rsvp`, { headers: await headers(key, false), cache: "no-store" })),
  wishes: async (slug: string) => unwrap<Wish[]>(await fetch(`/api/invitations/${slug}/wishes`, { cache: "no-store" })),
  upload,
  plan: async (slug: string, key: string) => unwrap<Plan>(await fetch(`/api/invitations/${slug}/plan`, { headers: await headers(key, false), cache: "no-store" })),
  savePlan: async (slug: string, plan: Plan, key: string) => unwrap<Plan>(await fetch(`/api/invitations/${slug}/plan`, { method: "PUT", headers: await headers(key), body: JSON.stringify(plan) })),
  saveGuests: async (slug: string, guests: Guest[], key: string) => unwrap<{ guests: Guest[] }>(await fetch(`/api/invitations/${slug}/guests`, { method: "PUT", headers: await headers(key), body: JSON.stringify({ guests }) })),

  /* Đăng nhập: nhận thiệp, người quản lý, thiệp của tôi */
  claim: async (slug: string, key: string) => unwrap<{ members: Member[] }>(await fetch(`/api/invitations/${slug}/claim`, { method: "POST", headers: await headers(), body: JSON.stringify({ key }) })),
  members: async (slug: string) => unwrap<Members>(await fetch(`/api/invitations/${slug}/members`, { headers: await headers("", false), cache: "no-store" })),
  addMember: async (slug: string, email: string) => unwrap<Members>(await fetch(`/api/invitations/${slug}/members`, { method: "POST", headers: await headers(), body: JSON.stringify({ email }) })),
  removeMember: async (slug: string, email: string) => unwrap<Members>(await fetch(`/api/invitations/${slug}/members`, { method: "DELETE", headers: await headers(), body: JSON.stringify({ email }) })),
  myInvitations: async () => unwrap<InvitationSummary[]>(await fetch(`/api/my/invitations`, { headers: await headers("", false), cache: "no-store" })),
};
