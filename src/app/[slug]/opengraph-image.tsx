import { ImageResponse } from "next/og";
import { getStore } from "@/lib/store";
import { OG_SIZE, ogImage } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Thiệp cưới";

/** Ảnh xem trước khi gửi link thiệp qua Zalo, Messenger, Facebook */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const inv = await (await getStore()).getInvitation(slug);
  if (!inv) return new ImageResponse(<div style={{ width: "100%", height: "100%", background: "#F6EFE3" }} />, OG_SIZE);
  return ogImage(inv);
}
