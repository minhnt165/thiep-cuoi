import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Invitation } from "@/components/invitation/Invitation";
import { toPublic } from "@/lib/schema";
import { getStore } from "@/lib/store";
import { longDate } from "@/lib/dates";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ to?: string | string[] }> };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const inv = await (await getStore()).getInvitation(slug);
  if (!inv) return { title: "Không tìm thấy thiệp" };
  const title = `${inv.groom.shortName} & ${inv.bride.shortName}`;
  const description = `Trân trọng kính mời bạn tới dự ${inv.mainEvent.title.toLowerCase()} của ${inv.groom.shortName} và ${inv.bride.shortName}, ${longDate(inv.mainEvent.date)}.`;
  // Ảnh xem trước do opengraph-image.tsx cùng thư mục sinh ra
  return {
    title,
    description,
    openGraph: { title: `${title} · Thiệp cưới`, description, type: "website", url: `${SITE}/${slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function InvitationPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { to } = await searchParams;
  const guest = (Array.isArray(to) ? to[0] : (to ?? "")).trim().slice(0, 80);
  const store = await getStore();
  const inv = await store.getInvitation(slug);
  if (!inv) notFound();
  const wishes = await store.listWishes(slug);
  return <Invitation data={toPublic(inv)} wishes={wishes} mode="live" guest={guest} />;
}
