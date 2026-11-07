import type { Metadata } from "next";
import { EditorLoader } from "@/components/editor/EditorLoader";
import "@/components/editor/editor.css";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { title: "Chỉnh sửa thiệp", robots: { index: false } };

export default async function EditPage({ params }: Props) {
  const { slug } = await params;
  return <EditorLoader slug={slug} />;
}
