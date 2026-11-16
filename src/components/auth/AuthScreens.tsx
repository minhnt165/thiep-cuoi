"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { AuthState } from "@/lib/client/auth";
import { api, ApiError } from "@/lib/client/api";
import { readKey } from "@/lib/client/edit-key";
import type { Member } from "@/lib/members";
import "./auth.css";

/** Logo Google 4 màu (nhận diện nút đăng nhập, không dùng cho mục đích khác) */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="au">
      <div className="au-card">
        <div className="au-mark" aria-hidden="true">♥</div>
        <h1>{title}</h1>
        {children}
        <Link href="/" className="au-home">← Về trang chủ</Link>
      </div>
    </main>
  );
}

/** Màn đăng nhập: Google (Supabase) hoặc gõ email (chế độ thử trên máy) */
export function LoginScreen({ session, title, note }: { session: AuthState; title: string; note?: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function go(e?: FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await session.signIn(email);
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title={title}>
      <p className="au-lede">{note ?? "Đăng nhập để sửa thiệp, xem khách mời, chi phí và sổ tiền mừng. Cô dâu và chú rể mỗi người đăng nhập bằng tài khoản của mình."}</p>
      {session.mode === "dev" ? (
        <form className="au-form" onSubmit={go}>
          <label className="au-field">
            Email (chế độ thử trên máy)
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@gmail.com" required autoFocus />
          </label>
          <button type="submit" className="au-btn primary" disabled={busy}>Đăng nhập</button>
        </form>
      ) : (
        <button type="button" className="au-btn google" onClick={() => go()} disabled={busy}>
          <GoogleMark />
          {busy ? "Đang chuyển sang Google…" : "Đăng nhập bằng Google"}
        </button>
      )}
      {err && <p className="au-err" role="alert">{err}</p>}
    </Shell>
  );
}

/** Thiệp chưa có người quản lý: nhập khóa sửa (hoặc dán link chỉnh sửa cũ) để nhận về tài khoản */
export function ClaimScreen({ slug, session, initialKey, onDone }: { slug: string; session: AuthState; initialKey?: string; onDone: () => void }) {
  const [key, setKey] = useState(() => initialKey || readKey(slug));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    let v = key.trim();
    const m = /[?&]key=([^&#\s]+)/.exec(v);
    if (m) v = decodeURIComponent(m[1]);
    setBusy(true);
    setErr("");
    try {
      await api.claim(slug, v);
      onDone();
    } catch (x) {
      setErr((x as Error).message);
      setBusy(false);
    }
  }

  return (
    <Shell title={`Nhận thiệp /${slug}`}>
      <p className="au-lede">
        Thiệp này tạo từ trước khi có đăng nhập. Nhập khóa sửa (hoặc dán link chỉnh sửa cũ) để gắn thiệp vào tài khoản <b>{session.email}</b>. Sau đó link chỉnh sửa cũ hết tác dụng, ai cần vào thì bạn mời bằng email.
      </p>
      <form className="au-form" onSubmit={submit}>
        <label className="au-field">
          Khóa sửa hoặc link chỉnh sửa
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} required autoComplete="off" />
        </label>
        <button type="submit" className="au-btn primary" disabled={busy}>{busy ? "Đang nhận…" : "Nhận thiệp"}</button>
      </form>
      {err && <p className="au-err" role="alert">{err}</p>}
      <button type="button" className="au-link" onClick={() => session.signOut()}>Đăng nhập tài khoản khác</button>
    </Shell>
  );
}

/** Đăng nhập rồi nhưng không phải người quản lý thiệp */
export function DeniedScreen({ session, message }: { session: AuthState; message: string }) {
  return (
    <Shell title="Chưa có quyền vào thiệp này">
      <p className="au-lede">{message}</p>
      <p className="au-lede">Nhờ cô dâu hoặc chú rể mời email <b>{session.email}</b> ở tab <b>Chia sẻ</b> của trình chỉnh sửa.</p>
      <button type="button" className="au-btn" onClick={() => session.signOut()}>Đăng nhập tài khoản khác</button>
    </Shell>
  );
}

export function LoadingScreen() {
  return <main className="ed-gate"><p className="hint">Đang tải…</p></main>;
}

/** Người quản lý thiệp: xem, mời thêm bằng email, bỏ bớt (tab Chia sẻ) */
export function MembersPanel({ slug, session }: { slug: string; session: AuthState }) {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.members(slug).then((r) => setMembers(r.members)).catch((e) => setErr((e as Error).message));
  }, [slug]);

  async function run(fn: () => Promise<{ members: Member[] }>) {
    setBusy(true);
    setErr("");
    try {
      setMembers((await fn()).members);
      return true;
    } catch (e) {
      setErr((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function invite(e: FormEvent) {
    e.preventDefault();
    if (await run(() => api.addMember(slug, email))) setEmail("");
  }

  async function remove(m: Member) {
    const self = m.email === session.email;
    if (!window.confirm(self ? "Bỏ chính bạn khỏi thiệp? Bạn sẽ không vào được nữa." : `Bỏ ${m.email} khỏi danh sách quản lý?`)) return;
    if (await run(() => api.removeMember(slug, m.email)) && self) await session.signOut();
  }

  return (
    <div className="share au-members">
      <b>Người quản lý thiệp</b>
      <p className="hint">Ai có tên ở đây đăng nhập bằng Google với đúng email này là vào được trình chỉnh sửa và trang Quản lý cưới. Mọi người có quyền như nhau.</p>
      {members === null && !err && <p className="hint">Đang tải…</p>}
      {members && (
        <ul>
          {members.map((m) => (
            <li key={m.email}>
              <span className="au-av" aria-hidden="true">{m.email.charAt(0).toUpperCase()}</span>
              <span className="au-who">
                <span>
                  {m.email}
                  {m.email === session.email && <em> (bạn)</em>}
                </span>
                {m.addedBy && <small>Được {m.addedBy} mời</small>}
              </span>
              {members.length > 1 && <button type="button" className="btn2 danger" disabled={busy} onClick={() => remove(m)}>Bỏ</button>}
            </li>
          ))}
        </ul>
      )}
      <form className="row" onSubmit={invite}>
        <input className="au-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Google của người kia" required aria-label="Email người được mời" />
        <button type="submit" className="btn2" disabled={busy || !email}>Mời</button>
      </form>
      {err && <p className="hint" style={{ color: "var(--ui-danger)" }} role="alert">{err}</p>}
      <p className="hint">Mời xong, gửi họ link dưới đây để đăng nhập. Không cần gửi khóa sửa nữa.</p>
      <code>{typeof window === "undefined" ? "" : window.location.origin}/edit/{slug}</code>
    </div>
  );
}

/** Nút đăng nhập gọn đặt trong trang (trang chủ, form tạo thiệp) */
export function InlineLogin({ session, label = "Đăng nhập bằng Google" }: { session: AuthState; label?: string }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  async function go(e?: FormEvent) {
    e?.preventDefault();
    setErr("");
    try {
      await session.signIn(email);
    } catch (x) {
      setErr((x as Error).message);
    }
  }
  return (
    <div className="au-inline">
      {session.mode === "dev" ? (
        <form className="row" onSubmit={go}>
          <input className="au-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (chế độ thử trên máy)" required aria-label="Email" />
          <button type="submit" className="au-btn primary">Đăng nhập</button>
        </form>
      ) : (
        <button type="button" className="au-btn google" onClick={() => go()}><GoogleMark />{label}</button>
      )}
      {err && <p className="au-err" role="alert">{err}</p>}
    </div>
  );
}

/** Dòng nhỏ "đang đăng nhập email · Đăng xuất" */
export function AccountLine({ session }: { session: AuthState }) {
  if (session.mode === "off" || !session.email) return null;
  return (
    <p className="au-account">
      Đang đăng nhập <b>{session.email}</b> · <button type="button" onClick={() => session.signOut()}>Đăng xuất</button>
    </p>
  );
}

export function isAuthCode(e: unknown, code: string): boolean {
  return e instanceof ApiError && e.code === code;
}
