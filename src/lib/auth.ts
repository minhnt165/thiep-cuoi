import "server-only";
import { timingSafeEqual } from "node:crypto";
import type { Invitation } from "@/lib/schema";
import { getStore } from "@/lib/store";

export const EDIT_KEY_HEADER = "x-edit-key";

function same(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/**
 * Trả về thiệp nếu header x-edit-key khớp, ngược lại trả về Response lỗi.
 * Giai đoạn 1 chưa có tài khoản: ai giữ khóa sửa thì sửa được.
 */
export async function requireEditor(req: Request, slug: string): Promise<Invitation | Response> {
  const store = await getStore();
  const inv = await store.getInvitation(slug);
  if (!inv) return Response.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  const key = req.headers.get(EDIT_KEY_HEADER) ?? "";
  if (!key || !same(key, inv.editKey)) return Response.json({ error: "Khóa sửa không đúng" }, { status: 401 });
  return inv;
}
