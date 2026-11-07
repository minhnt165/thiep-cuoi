import { ImageResponse } from "next/og";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/schema";
import { sampleInvitation } from "@/lib/sample";
import { OG_SIZE, ogImage } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Mẫu thiệp cưới";

export function generateStaticParams() {
  return TEMPLATE_IDS.map((template) => ({ template }));
}

export default async function Image({ params }: { params: Promise<{ template: string }> }) {
  const { template } = await params;
  if (!TEMPLATE_IDS.includes(template as TemplateId)) return new ImageResponse(<div style={{ width: "100%", height: "100%", background: "#F6EFE3" }} />, OG_SIZE);
  return ogImage(sampleInvitation("demo", template as TemplateId, "demo-demo-demo"));
}
