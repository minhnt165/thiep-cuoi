import type { Metadata } from "next";
import { PlanLoader } from "@/components/plan/PlanLoader";
import { authMode } from "@/lib/auth";
import "@/components/editor/editor.css";
import "@/components/plan/plan.css";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { title: "Quản lý cưới", robots: { index: false } };

export default async function PlanPage({ params }: Props) {
  const { slug } = await params;
  return <PlanLoader slug={slug} authMode={authMode()} />;
}
