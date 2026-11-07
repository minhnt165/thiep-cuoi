import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Invitation } from "@/components/invitation/Invitation";
import { TEMPLATE_IDS, toPublic, type TemplateId } from "@/lib/schema";
import { SAMPLE_WISHES, sampleInvitation } from "@/lib/sample";
import { THEMES } from "@/lib/templates";

type Props = { params: Promise<{ template: string }> };

export function generateStaticParams() {
  return TEMPLATE_IDS.map((template) => ({ template }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { template } = await params;
  const theme = THEMES[template as TemplateId];
  return { title: theme ? `Mẫu ${theme.name}` : "Mẫu thiệp" };
}

/** Xem thử một mẫu với dữ liệu giả, không ghi gì vào store */
export default async function DemoPage({ params }: Props) {
  const { template } = await params;
  if (!TEMPLATE_IDS.includes(template as TemplateId)) notFound();
  const inv = sampleInvitation("demo", template as TemplateId, "demo-demo-demo");
  return <Invitation data={toPublic(inv)} wishes={SAMPLE_WISHES} mode="demo" />;
}
