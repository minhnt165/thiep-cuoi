import { z } from "zod";

/**
 * Thành viên quản lý một thiệp (cô dâu, chú rể…), nhận diện bằng email tài khoản
 * đăng nhập. Mọi thành viên có quyền như nhau. Thiệp chưa có thành viên nào là
 * thiệp "chưa nhận": người giữ khóa sửa đăng nhập rồi nhận về tài khoản mình.
 */

export const MemberSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email không hợp lệ").max(200),
  addedAt: z.string().default(() => new Date().toISOString()),
  /** Email người đã mời; rỗng nếu là người tạo/nhận thiệp */
  addedBy: z.string().default(""),
});
export type Member = z.infer<typeof MemberSchema>;

export const EmailSchema = z.string().trim().toLowerCase().email("Email không hợp lệ").max(200);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isMember(members: Member[], email: string | null | undefined): boolean {
  if (!email) return false;
  const e = normalizeEmail(email);
  return members.some((m) => m.email === e);
}

/** Thêm thành viên; trả danh sách mới (không đổi nếu đã có) */
export function addMember(members: Member[], email: string, addedBy = ""): Member[] {
  const e = normalizeEmail(email);
  if (members.some((m) => m.email === e)) return members;
  return [...members, { email: e, addedAt: new Date().toISOString(), addedBy: addedBy ? normalizeEmail(addedBy) : "" }];
}

/** Bỏ thành viên. Không cho bỏ người cuối cùng, kẻo thiệp không ai vào được. */
export function removeMember(members: Member[], email: string): { members: Member[] } | { error: string } {
  const e = normalizeEmail(email);
  if (!members.some((m) => m.email === e)) return { error: "Người này không có trong danh sách" };
  if (members.length <= 1) return { error: "Thiệp cần ít nhất một người quản lý" };
  return { members: members.filter((m) => m.email !== e) };
}
