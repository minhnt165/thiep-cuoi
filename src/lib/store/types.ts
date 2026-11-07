import type { Invitation, Rsvp, Wish } from "@/lib/schema";

/**
 * Lớp lưu trữ. Hai bản cài: file (chạy máy cá nhân, không cần tài khoản gì)
 * và Supabase (khi đưa lên mạng). Chọn qua biến môi trường STORE.
 */
export interface Store {
  getInvitation(slug: string): Promise<Invitation | null>;
  saveInvitation(inv: Invitation): Promise<void>;
  listInvitations(): Promise<Pick<Invitation, "slug" | "template" | "groom" | "bride" | "mainEvent" | "updatedAt">[]>;

  listWishes(slug: string): Promise<Wish[]>;
  addWish(slug: string, wish: Wish): Promise<void>;

  listRsvps(slug: string): Promise<Rsvp[]>;
  addRsvp(slug: string, rsvp: Rsvp): Promise<void>;

  /** Lưu file tải lên, trả về URL công khai để nhúng vào thiệp */
  saveUpload(slug: string, fileName: string, data: Uint8Array, contentType: string): Promise<string>;
  /** Đọc file đã tải lên (chỉ bản file dùng; Supabase trả URL public nên không cần) */
  readUpload?(slug: string, fileName: string): Promise<{ data: Uint8Array; contentType: string } | null>;
}
