"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { THEME_LIST } from "@/lib/templates";
import { rememberKey } from "@/lib/client/edit-key";
import { useAuth, type AuthMode } from "@/lib/client/auth";
import { authHeaders } from "@/lib/client/api";
import { AccountLine, InlineLogin } from "@/components/auth/AuthScreens";

export function CreateForm({ needsCode = false, authMode = "off" }: { needsCode?: boolean; authMode?: AuthMode }) {
  const router = useRouter();
  // Bật đăng nhập: phải đăng nhập trước, người tạo thành người quản lý thiệp
  const session = useAuth(authMode);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const slug = String(f.get("slug") ?? "").trim().toLowerCase();
    const template = String(f.get("template") ?? "");
    const code = String(f.get("code") ?? "").trim();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/invitations", { method: "POST", headers: await authHeaders(), body: JSON.stringify({ slug, template, code }) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Tạo chưa được");
      rememberKey(body.slug, body.editKey);
      router.push(`/edit/${body.slug}`);
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  if (authMode !== "off" && session.ready && !session.email) {
    return (
      <div className="create">
        <p className="hint">Đăng nhập trước để tạo thiệp. Thiệp gắn với tài khoản của bạn, đổi máy vẫn vào sửa được, không cần giữ link bí mật.</p>
        <InlineLogin session={session} label="Đăng nhập bằng Google để tạo thiệp" />
      </div>
    );
  }

  return (
    <form className="create" onSubmit={submit}>
      <AccountLine session={session} />
      <label>
        Đường dẫn thiệp
        <input name="slug" placeholder="tuan-ha" pattern="[a-z0-9-]{3,60}" required autoComplete="off" />
        <span className="hint">Khách sẽ mở thiệp tại /đường-dẫn. Chỉ dùng chữ thường, số và dấu gạch ngang.</span>
      </label>
      <label>
        Mẫu
        <select name="template" defaultValue={THEME_LIST[0].id}>
          {THEME_LIST.map((t) => (
            <option key={t.id} value={t.id}>{t.name} · {t.tagline}</option>
          ))}
        </select>
        <span className="hint">Đổi mẫu sau vẫn được, nội dung không mất.</span>
      </label>
      {needsCode && (
        <label>
          Mã tạo thiệp
          <input name="code" required autoComplete="off" />
          <span className="hint">Chủ site cấp mã này để tránh người lạ tạo thiệp rác.</span>
        </label>
      )}
      {err && <p className="err">{err}</p>}
      <button type="submit" disabled={busy || (authMode !== "off" && !session.email)}>{busy ? "Đang tạo…" : "Tạo thiệp"}</button>
    </form>
  );
}
