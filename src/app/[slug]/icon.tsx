import { heartIcon } from "@/lib/icon-image";
import { getStore } from "@/lib/store";
import { THEMES } from "@/lib/templates";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon của từng thiệp lấy màu nhấn của mẫu (hoặc màu riêng đã chọn) */
export default async function Icon({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const inv = await (await getStore()).getInvitation(slug);
  if (!inv) return heartIcon(size.width);
  const theme = THEMES[inv.template];
  return heartIcon(size.width, inv.accent || theme.colors.accent, theme.colors.accentInk);
}
