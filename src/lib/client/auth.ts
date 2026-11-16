import { useCallback, useEffect, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Đăng nhập phía trình duyệt. Chế độ do server quyết định (truyền xuống qua prop):
 * - "supabase": Google qua Supabase Auth, phiên lưu trong localStorage, tự làm mới token.
 * - "dev": giả lập bằng email gõ tay, chỉ để thử luồng trên máy.
 * - "off": không đăng nhập, dùng khóa sửa như cũ.
 */
export type AuthMode = "off" | "supabase" | "dev";

let mode: AuthMode = "off";
let client: SupabaseClient | null = null;

const DEV_KEY = "thiep:devAuth";
const DEV_EVENT = "thiep-dev-auth";

function supabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY");
  client = createClient(url, anon, { auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  return client;
}

function readDev(): string | null {
  try {
    return typeof window === "undefined" ? null : localStorage.getItem(DEV_KEY);
  } catch {
    return null;
  }
}

/** Token gửi kèm mỗi lần gọi API (null nếu chưa đăng nhập hoặc không bật đăng nhập) */
export async function accessToken(): Promise<string | null> {
  if (mode === "dev") {
    const email = readDev();
    return email ? `dev:${email}` : null;
  }
  if (mode === "supabase") {
    const { data } = await supabase().auth.getSession();
    return data.session?.access_token ?? null;
  }
  return null;
}

export interface AuthState {
  mode: AuthMode;
  /** Đã biết đang đăng nhập hay chưa (Supabase cần đọc phiên lúc đầu) */
  ready: boolean;
  email: string | null;
  /** Google: chuyển sang trang Google rồi quay lại đúng trang này. Dev: truyền email. */
  signIn: (devEmail?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(m: AuthMode): AuthState {
  const [state, setState] = useState<{ ready: boolean; email: string | null }>(() => {
    mode = m;
    // Chưa biết phiên cho tới khi effect chạy: server và client render giống nhau (không lệch hydration)
    return m === "off" ? { ready: true, email: null } : { ready: false, email: null };
  });

  useEffect(() => {
    mode = m;
    if (m === "supabase") {
      const c = supabase();
      let alive = true;
      c.auth.getSession().then(({ data }) => {
        if (alive) setState({ ready: true, email: data.session?.user.email?.toLowerCase() ?? null });
      });
      const { data: sub } = c.auth.onAuthStateChange((_e, session) => {
        setState({ ready: true, email: session?.user.email?.toLowerCase() ?? null });
      });
      return () => {
        alive = false;
        sub.subscription.unsubscribe();
      };
    }
    if (m === "dev") {
      const h = () => setState({ ready: true, email: readDev() });
      h();
      window.addEventListener(DEV_EVENT, h);
      return () => window.removeEventListener(DEV_EVENT, h);
    }
  }, [m]);

  const signIn = useCallback(async (devEmail?: string) => {
    if (m === "dev") {
      const e = (devEmail ?? "").trim().toLowerCase();
      if (!e.includes("@")) throw new Error("Nhập email");
      localStorage.setItem(DEV_KEY, e);
      window.dispatchEvent(new Event(DEV_EVENT));
      return;
    }
    if (m === "supabase") {
      const back = window.location.origin + window.location.pathname + window.location.search;
      const { error } = await supabase().auth.signInWithOAuth({ provider: "google", options: { redirectTo: back } });
      if (error) throw error;
    }
  }, [m]);

  const signOut = useCallback(async () => {
    if (m === "dev") {
      localStorage.removeItem(DEV_KEY);
      window.dispatchEvent(new Event(DEV_EVENT));
      return;
    }
    if (m === "supabase") await supabase().auth.signOut();
  }, [m]);

  return { mode: m, ready: state.ready, email: state.email, signIn, signOut };
}
