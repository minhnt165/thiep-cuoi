"use client";

import { useAuth, type AuthMode } from "@/lib/client/auth";

/** Thanh điều hướng dính đầu trang chủ: các phần chính + đăng nhập (khi bật) + nút tạo thiệp */
export function HomeNav({ authMode }: { authMode: AuthMode }) {
  const session = useAuth(authMode);
  return (
    <nav className="home-nav" aria-label="Trang chủ">
      <a href="#top" className="home-brand">
        <span aria-hidden="true">♥</span> Thiệp cưới
      </a>
      <div className="home-nav-links">
        <a href="#templates">Mẫu thiệp</a>
        <a href="#quan-ly">Quản lý cưới</a>
      </div>
      <div className="home-nav-acts">
        {authMode !== "off" && session.ready && (
          session.email ? (
            <button type="button" className="home-nav-link" onClick={() => session.signOut()} title={`Đang đăng nhập ${session.email}`}>Đăng xuất</button>
          ) : authMode === "supabase" ? (
            <button type="button" className="home-nav-link" onClick={() => session.signIn().catch(() => undefined)}>Đăng nhập</button>
          ) : (
            <a href="#create" className="home-nav-link">Đăng nhập</a>
          )
        )}
        <a href="#create" className="home-nav-cta">Tạo thiệp</a>
      </div>
    </nav>
  );
}
