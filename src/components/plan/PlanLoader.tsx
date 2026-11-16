"use client";

import dynamic from "next/dynamic";
import type { AuthMode } from "@/lib/client/auth";

/** Trang quản lý chỉ chạy ở client: cần khóa sửa trong localStorage, không cần SEO. */
const Planner = dynamic(() => import("./Planner").then((m) => m.Planner), {
  ssr: false,
  loading: () => <main className="ed-gate"><p className="hint">Đang tải…</p></main>,
});

export function PlanLoader({ slug, authMode }: { slug: string; authMode: AuthMode }) {
  return <Planner slug={slug} authMode={authMode} />;
}
