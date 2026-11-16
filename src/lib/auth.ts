import "server-only";
import { timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Invitation } from "@/lib/schema";
import { isMember } from "@/lib/members";
import { getStore } from "@/lib/store";

export const EDIT_KEY_HEADER = "x-edit-key";

/**
 * Cách xác thực chủ thiệp:
 * - "off": chỉ khóa sửa (chạy trên máy, không cần tài khoản gì).
 * - "supabase": đăng nhập Google qua Supabase Auth. Bật khi STORE=supabase và có NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * - "dev": giả lập đăng nhập bằng email để thử luồng trên máy (AUTH=dev, STORE=file, không phải production).
 */
export type AuthMode = "off" | "supabase" | "dev";

export function authMode(): AuthMode {
  if (process.env.STORE === "supabase") return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "supabase" : "off";
  if (process.env.AUTH === "dev" && process.env.NODE_ENV !== "production") return "dev";
  return "off";
}

function same(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

let admin: SupabaseClient | null = null;
function supabaseAdmin(): SupabaseClient {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
  admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

export interface AuthUser {
  email: string;
}

type Denied = Response;

const deny = (status: number, code: string, error: string): Denied => Response.json({ error, code }, { status });

/**
 * Người đăng nhập theo header Authorization: Bearer <token>.
 * null = không gửi token; Response = token sai/hết hạn.
 */
export async function getUser(req: Request): Promise<AuthUser | null | Denied> {
  const mode = authMode();
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (mode === "off" || !token) return null;
  if (mode === "dev") {
    const email = token.startsWith("dev:") ? token.slice(4).trim().toLowerCase() : "";
    return email.includes("@") ? { email } : deny(401, "login", "Phiên đăng nhập không hợp lệ");
  }
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user?.email) return deny(401, "login", "Phiên đăng nhập đã hết hạn, đăng nhập lại");
  return { email: data.user.email.toLowerCase() };
}

/** So khóa sửa an toàn thời gian */
export function editKeyMatches(inv: Invitation, key: string): boolean {
  return !!key && same(key, inv.editKey);
}

function keyMatches(req: Request, inv: Invitation): boolean {
  return editKeyMatches(inv, req.headers.get(EDIT_KEY_HEADER) ?? "");
}

/**
 * Trả về thiệp nếu người gọi được sửa, ngược lại trả Response lỗi (kèm `code` để giao diện biết hiện gì).
 * - Không bật đăng nhập: đúng khóa sửa là được.
 * - Bật đăng nhập: thành viên của thiệp được. Thiệp chưa ai nhận thì khóa sửa vẫn dùng được
 *   (thiệp tạo từ trước), còn đã có người quản lý thì khóa sửa hết tác dụng: lộ link cũng không sao.
 */
export async function requireEditor(req: Request, slug: string): Promise<Invitation | Response> {
  const store = await getStore();
  const inv = await store.getInvitation(slug);
  if (!inv) return Response.json({ error: "Không tìm thấy thiệp" }, { status: 404 });

  if (authMode() === "off") {
    return keyMatches(req, inv) ? inv : deny(401, "key", "Khóa sửa không đúng");
  }

  const user = await getUser(req);
  if (user instanceof Response) return user;
  if (user && isMember(inv.members, user.email)) return inv;
  if (inv.members.length === 0) {
    // Đã đăng nhập thì mời nhận thiệp (rõ ràng hơn là lặng lẽ dùng khóa cũ); chưa đăng nhập thì khóa vẫn dùng được
    if (user) return deny(403, "claim", "Thiệp chưa có người quản lý. Nhập khóa sửa để nhận thiệp về tài khoản của bạn.");
    return keyMatches(req, inv) ? inv : deny(401, "login", "Đăng nhập để quản lý thiệp");
  }
  return user ? deny(403, "not_member", `Tài khoản ${user.email} chưa được mời quản lý thiệp này`) : deny(401, "login", "Đăng nhập để quản lý thiệp");
}

/** Như requireEditor nhưng bắt buộc đăng nhập và là thành viên (quản lý thành viên) */
export async function requireMember(req: Request, slug: string): Promise<{ inv: Invitation; user: AuthUser } | Response> {
  if (authMode() === "off") return deny(404, "off", "Chưa bật đăng nhập");
  const user = await getUser(req);
  if (user instanceof Response) return user;
  if (!user) return deny(401, "login", "Đăng nhập để quản lý thiệp");
  const inv = await (await getStore()).getInvitation(slug);
  if (!inv) return Response.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  if (!isMember(inv.members, user.email)) return deny(403, "not_member", `Tài khoản ${user.email} chưa được mời quản lý thiệp này`);
  return { inv, user };
}

/** Có gửi thông tin xác thực (khóa hoặc token) không: để GET thiệp biết trả bản đầy đủ hay bản công khai */
export function hasCredentials(req: Request): boolean {
  return !!req.headers.get(EDIT_KEY_HEADER) || (req.headers.get("authorization") ?? "").startsWith("Bearer ");
}
