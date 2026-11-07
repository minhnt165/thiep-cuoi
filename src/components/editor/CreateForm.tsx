"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { THEME_LIST } from "@/lib/templates";
import { rememberKey } from "@/lib/client/edit-key";

export function CreateForm() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const slug = String(f.get("slug") ?? "").trim().toLowerCase();
    const template = String(f.get("template") ?? "");
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/invitations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, template }) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Tạo chưa được");
      rememberKey(body.slug, body.editKey);
      router.push(`/edit/${body.slug}`);
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className="create" onSubmit={submit}>
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
      {err && <p className="err">{err}</p>}
      <button type="submit" disabled={busy}>{busy ? "Đang tạo…" : "Tạo thiệp"}</button>
    </form>
  );
}
