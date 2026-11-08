import type { PublicInvitation } from "@/lib/schema";

/**
 * Class theo độ dài tên gọi dài nhất của cô dâu/chú rể, để CSS thu nhỏ chữ ở
 * những chỗ hẹp (nhãn cạnh ảnh, chú thích polaroid, dải tên trên bìa) thay vì
 * để tên xuống dòng rồi bị ảnh che mất.
 */
export function nameLengthClass(data: Pick<PublicInvitation, "groom" | "bride">): string {
  const n = Math.max(data.groom.shortName.trim().length, data.bride.shortName.trim().length);
  if (n > 12) return "names-xlong";
  if (n > 8) return "names-long";
  return "";
}
