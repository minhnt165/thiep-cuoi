import type { Invitation, Rsvp, Wish } from "@/lib/schema";
import type { Plan } from "@/lib/plan";

/**
 * Lớp lưu trữ. Hai bản cài: file (chạy máy cá nhân, không cần tài khoản gì)
 * và Supabase (khi đưa lên mạng). Chọn qua biến môi trường STORE.
 */
export interface Store {
  getInvitation(slug: string): Promise<Invitation | null>;
  saveInvitation(inv: Invitation): Promise<void>;
  listInvitations(): Promise<Pick<Invitation, "slug" | "template" | "groom" | "bride" | "mainEvent" | "updatedAt">[]>;
  /** Thiệp mà email này là thành viên quản lý */
  listInvitationsFor(email: string): Promise<Pick<Invitation, "slug" | "template" | "groom" | "bride" | "mainEvent" | "updatedAt">[]>;

  listWishes(slug: string): Promise<Wish[]>;
  addWish(slug: string, wish: Wish): Promise<void>;

  listRsvps(slug: string): Promise<Rsvp[]>;
  addRsvp(slug: string, rsvp: Rsvp): Promise<void>;

  /** Sổ kế hoạch cưới (công việc, chi phí, tiền mừng); null nếu chưa tạo */
  getPlan(slug: string): Promise<Plan | null>;
  savePlan(slug: string, plan: Plan): Promise<void>;

  /** Lưu file tải lên, trả về URL công khai để nhúng vào thiệp */
  saveUpload(slug: string, fileName: string, data: Uint8Array, contentType: string): Promise<string>;
  /** Đọc file đã tải lên (chỉ bản file dùng; Supabase trả URL public nên không cần) */
  readUpload?(slug: string, fileName: string): Promise<{ data: Uint8Array; contentType: string } | null>;
  /**
   * Cấp link ký sẵn để trình duyệt tải thẳng lên kho (bỏ qua giới hạn 4,5MB của Vercel).
   * Chỉ bản Supabase có.
   */
  createSignedUpload?(slug: string, fileName: string, contentType: string): Promise<{ uploadUrl: string; publicUrl: string }>;
}
