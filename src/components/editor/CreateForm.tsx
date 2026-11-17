"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { THEME_LIST } from "@/lib/templates";
import { templateShot } from "@/lib/template-shots";
import type { TemplateId } from "@/lib/schema";
import { rememberKey } from "@/lib/client/edit-key";
import { useAuth, type AuthMode } from "@/lib/client/auth";
import { authHeaders } from "@/lib/client/api";
import { AccountLine, InlineLogin } from "@/components/auth/AuthScreens";
import { DatePicker } from "@/components/DatePicker";

/** "Anh Tuấn", "Thu Hà" → "tuan-ha": bỏ dấu, lấy chữ cuối của tên gọi (thường là tên chính) */
export function suggestSlug(groom: string, bride: string): string {
  const part = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .split(/\s+/)
      .pop() ?? "";
  return [part(groom), part(bride)].filter(Boolean).join("-").slice(0, 60);
}

type SlugState = "idle" | "checking" | "free" | "taken" | "invalid";

const noopSubscribe = () => () => {};

/**
 * Tạo thiệp: hỏi tên gọi hai bạn và ngày cưới (thay dữ liệu mẫu), tự gợi ý đường dẫn
 * và báo còn trống không, chọn mẫu bằng ảnh bìa. Nút "Dùng mẫu này" ở trang chủ
 * mở trang với ?mau=<id> để chọn sẵn mẫu.
 */
export function CreateForm({ needsCode = false, authMode = "off" }: { needsCode?: boolean; authMode?: AuthMode }) {
  const router = useRouter();
  // Bật đăng nhập: phải đăng nhập trước, người tạo thành người quản lý thiệp
  const session = useAuth(authMode);
  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [date, setDate] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugState, setSlugState] = useState<SlugState>("idle");
  const [template, setTemplate] = useState<TemplateId>(THEME_LIST[0].id);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  // Tên miền trước ô đường dẫn: chỉ biết ở trình duyệt; server render rỗng nên không lệch hydration
  const host = useSyncExternalStore(noopSubscribe, () => window.location.host, () => "");

  // Mẫu chọn sẵn từ ?mau= (nút "Dùng mẫu này")
  useEffect(() => {
    const read = () => {
      const m = new URLSearchParams(window.location.search).get("mau");
      const t = THEME_LIST.find((x) => x.id === m);
      if (t) setTemplate(t.id);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  const finalSlug = slugEdited ? slug : suggestSlug(groom, bride);

  // Kiểm tra đường dẫn còn trống (thiệp công khai trả 404 nghĩa là chưa ai dùng)
  useEffect(() => {
    if (!finalSlug) return;
    if (!/^[a-z0-9-]{3,60}$/.test(finalSlug)) {
      const t = setTimeout(() => setSlugState("invalid"), 0);
      return () => clearTimeout(t);
    }
    let alive = true;
    const t = setTimeout(async () => {
      setSlugState("checking");
      try {
        const r = await fetch(`/api/invitations/${finalSlug}`, { cache: "no-store" });
        if (alive) setSlugState(r.status === 404 ? "free" : r.ok ? "taken" : "idle");
      } catch {
        if (alive) setSlugState("idle");
      }
    }, 400);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [finalSlug]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ slug: finalSlug, template, code, groom: groom || undefined, bride: bride || undefined, date: date || undefined }),
      });
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

  const shownState: SlugState = finalSlug ? slugState : "idle";
  const slugHint = {
    idle: "Khách mở thiệp tại địa chỉ này. Tự gợi ý từ tên hai bạn, sửa được.",
    checking: "Đang kiểm tra…",
    free: "✓ Còn trống, dùng được",
    taken: "Đường dẫn này đã có người dùng, thử thêm năm cưới, vd tuan-ha-2026",
    invalid: "Ít nhất 3 ký tự, chỉ chữ thường không dấu, số và dấu gạch ngang",
  }[shownState];

  return (
    <form className="create" onSubmit={submit}>
      <AccountLine session={session} />
      <div className="create-g2">
        <label>
          Tên chú rể
          <input value={groom} onChange={(e) => setGroom(e.target.value)} placeholder="Anh Tuấn" autoComplete="off" maxLength={40} />
        </label>
        <label>
          Tên cô dâu
          <input value={bride} onChange={(e) => setBride(e.target.value)} placeholder="Thu Hà" autoComplete="off" maxLength={40} />
        </label>
      </div>
      <div className="create-field">
        <span className="create-label">Ngày cưới</span>
        <DatePicker value={date} onChange={setDate} placeholder="Chọn ngày (sửa sau được)" clearable aria-label="Ngày cưới" />
      </div>
      <label>
        Đường dẫn thiệp
        <span className={`create-slug ${shownState}`}>
          <span className="create-slug-host">{host}/</span>
          <input
            value={finalSlug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
            }}
            placeholder="tuan-ha"
            required
            autoComplete="off"
            spellCheck={false}
          />
        </span>
        <span className={`hint slug-hint ${shownState}`} aria-live="polite">{slugHint}</span>
      </label>
      <fieldset className="create-tpl">
        <legend>Mẫu thiệp <span className="hint">· đổi sau vẫn được, nội dung không mất</span></legend>
        <div className="create-tpl-grid">
          {THEME_LIST.map((t) => (
            <label key={t.id} className={template === t.id ? "on" : ""} title={`${t.name} · ${t.tagline}`}>
              <input type="radio" name="template" value={t.id} checked={template === t.id} onChange={() => setTemplate(t.id)} />
              <img src={templateShot(t.id)} alt="" loading="lazy" decoding="async" />
              <span>{t.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {needsCode && (
        <label>
          Mã tạo thiệp
          <input value={code} onChange={(e) => setCode(e.target.value)} required autoComplete="off" />
          <span className="hint">Chủ site cấp mã này để tránh người lạ tạo thiệp rác.</span>
        </label>
      )}
      {err && <p className="err">{err}</p>}
      <button type="submit" className="create-submit" disabled={busy || shownState === "taken" || shownState === "invalid" || (authMode !== "off" && !session.email)}>
        {busy ? "Đang tạo…" : "Tạo thiệp và bắt đầu sửa →"}
      </button>
    </form>
  );
}
