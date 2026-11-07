import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div>
        <h1 style={{ fontWeight: 500, fontSize: 24 }}>Không tìm thấy thiệp</h1>
        <p style={{ color: "var(--ui-muted)" }}>Đường dẫn có thể đã gõ sai hoặc thiệp chưa được tạo.</p>
        <Link href="/">Về trang chủ</Link>
      </div>
    </main>
  );
}
