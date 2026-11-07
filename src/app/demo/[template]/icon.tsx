import { heartIcon } from "@/lib/icon-image";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/schema";
import { THEMES } from "@/lib/templates";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export function generateStaticParams() {
  return TEMPLATE_IDS.map((template) => ({ template }));
}

/** Favicon trang demo theo màu của mẫu */
export default async function Icon({ params }: { params: Promise<{ template: string }> }) {
  const { template } = await params;
  const theme = THEMES[template as TemplateId];
  return theme ? heartIcon(size.width, theme.colors.accent, theme.colors.accentInk) : heartIcon(size.width);
}
