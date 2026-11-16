"use client";

import dynamic from "next/dynamic";
import type { AuthMode } from "@/lib/client/auth";

/** Trình chỉnh sửa chỉ chạy ở client: cần localStorage (khóa sửa) và không cần SEO. */
const Editor = dynamic(() => import("./Editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => <main className="ed-gate"><p className="hint">Đang tải trình chỉnh sửa…</p></main>,
});

export function EditorLoader({ slug, authMode }: { slug: string; authMode: AuthMode }) {
  return <Editor slug={slug} authMode={authMode} />;
}
