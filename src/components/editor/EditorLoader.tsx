"use client";

import dynamic from "next/dynamic";

/** Trình chỉnh sửa chỉ chạy ở client: cần localStorage (khóa sửa) và không cần SEO. */
const Editor = dynamic(() => import("./Editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => <main className="ed-gate"><p className="hint">Đang tải trình chỉnh sửa…</p></main>,
});

export function EditorLoader({ slug }: { slug: string }) {
  return <Editor slug={slug} />;
}
