"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Invitation } from "@/lib/schema";
import { toPublic } from "@/lib/schema";
import { api, ApiError } from "@/lib/client/api";
import { useAuth, type AuthMode } from "@/lib/client/auth";
import { ClaimScreen, DeniedScreen, LoadingScreen, LoginScreen } from "@/components/auth/AuthScreens";
import { readKey, rememberKey } from "@/lib/client/edit-key";
import { Invitation as InvitationView } from "@/components/invitation/Invitation";
import { ContentPanel, CouplePanel, EventsPanel, GiftPanel, GuestsPanel, PhotosPanel, SectionsPanel, SharePanel, TemplatePanel, type Patch } from "./panels";
import { Icon, type IconName } from "@/components/plan/icons";
import "./editor.css";

const TABS = [
  { id: "template", label: "Mẫu", icon: "palette", desc: "Chọn kiểu thiệp, màu nhấn và nhạc nền. Đổi mẫu không mất nội dung." },
  { id: "couple", label: "Cặp đôi", icon: "heart", desc: "Tên cô dâu chú rể và bố mẹ hai bên, hiện ở phần báo tin." },
  { id: "events", label: "Sự kiện", icon: "calendar", desc: "Giờ, địa điểm tiệc chính và các lễ. Tiệc chính dùng cho đếm ngược và xác nhận tham dự." },
  { id: "photos", label: "Ảnh", icon: "image", desc: "Ảnh bìa, ảnh save the date và album. Ảnh tự nén trước khi tải lên." },
  { id: "content", label: "Nội dung", icon: "text", desc: "Câu chữ trên thiệp, màu dress code và chuyện của hai bạn." },
  { id: "gift", label: "Mừng cưới", icon: "gift", desc: "Tài khoản nhận mừng cưới. Nhập số tài khoản là có mã QR." },
  { id: "sections", label: "Hiển thị", icon: "layers", desc: "Bật tắt các phần hiện trên thiệp." },
  { id: "guests", label: "Khách", icon: "users", desc: "Ai đã xác nhận tham dự và lời chúc của khách." },
  { id: "share", label: "Chia sẻ", icon: "share", desc: "Link gửi khách và quyền chỉnh sửa thiệp." },
] as const satisfies readonly { id: string; label: string; icon: IconName; desc: string }[];
type Tab = (typeof TABS)[number]["id"];

/** Tab còn thiếu thứ quan trọng: hiện chấm nhắc trên thanh tab */
function needsAttention(tab: Tab, d: Invitation): boolean {
  if (tab === "photos") return !d.photos.cover && d.photos.album.length === 0;
  if (tab === "gift") return d.gifts.length === 0 && d.sections.includes("gift");
  if (tab === "events") return !d.mainEvent.venue;
  return false;
}

export function Editor({ slug, authMode = "off" }: { slug: string; authMode?: AuthMode }) {
  const search = useSearchParams();
  // Khóa sửa: lấy từ ?key= (lần đầu mở link) rồi nhớ vào trình duyệt.
  // Component này chỉ chạy ở client (ssr: false) nên đọc localStorage ngay được.
  const [key, setKey] = useState<string>(() => {
    const fromUrl = search.get("key");
    if (fromUrl) {
      rememberKey(slug, fromUrl);
      return fromUrl;
    }
    return readKey(slug);
  });

  // Xóa ?key= khỏi thanh địa chỉ sau khi đã nhớ, để link không bị chia sẻ nhầm
  useEffect(() => {
    if (search.get("key")) window.history.replaceState(null, "", `/edit/${slug}`);
  }, [search, slug]);
  const [draft, setDraft] = useState<Invitation | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [status, setStatus] = useState<{ text: string; err?: boolean }>({ text: "" });
  const [tab, setTab] = useState<Tab>("template");
  const [showCover, setShowCover] = useState(false);
  // Điện thoại: khung xem trước mở toàn màn hình bằng nút nổi
  const [previewOpen, setPreviewOpen] = useState(false);
  const rail = useRef<HTMLElement>(null);
  const [loadErr, setLoadErr] = useState("");
  const [errCode, setErrCode] = useState("");
  const [reload, setReload] = useState(0);
  const keyInput = useRef<HTMLInputElement>(null);
  // Bật đăng nhập: vào bằng tài khoản; khóa sửa (nếu còn nhớ) chỉ dùng cho thiệp chưa ai nhận
  const session = useAuth(authMode);
  const authOn = authMode !== "off";

  useEffect(() => {
    if (authOn ? !session.email : !key) return;
    api.load(slug, key)
      .then((inv) => {
        setDraft(inv);
        setSaved(JSON.stringify(inv));
        setLoadErr("");
        setErrCode("");
      })
      .catch((e) => {
        setDraft(null);
        setLoadErr((e as Error).message);
        setErrCode(e instanceof ApiError ? e.code : "");
      });
  }, [slug, key, authOn, session.email, reload]);

  const patch = useCallback<Patch>((fn) => {
    setDraft((d) => {
      if (!d) return d;
      const next = structuredClone(d);
      fn(next);
      return next;
    });
  }, []);

  const dirty = draft ? JSON.stringify(draft) !== saved : false;

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  async function save() {
    if (!draft) return;
    setStatus({ text: "Đang lưu…" });
    try {
      const inv = await api.save(draft, key);
      setDraft(inv);
      setSaved(JSON.stringify(inv));
      setStatus({ text: "Đã lưu" });
    } catch (e) {
      setStatus({ text: (e as Error).message, err: true });
    }
  }

  // Ctrl/Cmd + S
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, key]);

  const publicDraft = useMemo(() => (draft ? toPublic(draft) : null), [draft]);

  // Đổi tab: đưa tab đang chọn vào giữa thanh (điện thoại) và cuộn lên đầu phần nội dung
  useEffect(() => {
    rail.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ inline: "center", block: "nearest" });
    window.scrollTo({ top: 0 });
  }, [tab]);

  // Đang mở xem trước toàn màn hình thì khóa cuộn trang phía sau
  useEffect(() => {
    if (!previewOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setPreviewOpen(false); };
    window.addEventListener("keydown", h);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", h);
    };
  }, [previewOpen]);

  function submitKey(e: FormEvent) {
    e.preventDefault();
    const v = keyInput.current?.value.trim() ?? "";
    if (!v) return;
    rememberKey(slug, v);
    setKey(v);
  }

  if (authOn) {
    if (!session.ready) return <LoadingScreen />;
    if (!session.email || errCode === "login") return <LoginScreen session={session} title={`Chỉnh sửa thiệp /${slug}`} />;
    if (errCode === "claim") return <ClaimScreen slug={slug} session={session} initialKey={key} onDone={() => setReload((n) => n + 1)} />;
    if (loadErr) return <DeniedScreen session={session} message={loadErr} />;
  }

  if (!authOn && (!key || loadErr)) {
    return (
      <main className="ed-gate">
        <form onSubmit={submitKey}>
          <h1 style={{ fontSize: 18, margin: 0 }}>Chỉnh sửa thiệp /{slug}</h1>
          <p className="hint">{loadErr || "Trình duyệt này chưa có khóa sửa của thiệp."} Dán link chỉnh sửa hoặc khóa sửa vào đây.</p>
          <input ref={keyInput} className="f" placeholder="Khóa sửa" style={{ padding: 10, border: "1px solid var(--ui-line)", borderRadius: 8 }} />
          <button type="submit" className="ed-save">Mở trình chỉnh sửa</button>
          <Link href="/" className="hint">Về trang chủ</Link>
        </form>
      </main>
    );
  }

  if (!draft || !publicDraft) return <main className="ed-gate"><p className="hint">Đang tải…</p></main>;

  const panelProps = { d: draft, patch, editKey: key, session };
  const saving = status.text === "Đang lưu…";
  const saveKind = status.err ? "err" : saving ? "busy" : dirty ? "dirty" : "ok";
  const saveText = status.err ? status.text : saving ? "Đang lưu…" : dirty ? "Chưa lưu" : "Đã lưu";
  const idx = TABS.findIndex((t) => t.id === tab);
  const current = TABS[idx];
  const prevTab = TABS[idx - 1];
  const nextTab = TABS[idx + 1];

  return (
    <div className="ed">
      <header className="ed-top">
        <Link href="/" className="ed-icon-btn" aria-label="Về trang chủ"><Icon name="back" size={20} /></Link>
        <div className="ed-title">
          <b>{draft.groom.shortName} &amp; {draft.bride.shortName}</b>
          <span>/{draft.slug}</span>
        </div>
        <span className={`ed-state ${saveKind}`} role="status" title={saveText}><i aria-hidden="true" /><span>{saveText}</span></span>
        <Link href={`/plan/${draft.slug}`} className="ed-btn ghost"><Icon name="tasks" size={16} /><span>Quản lý cưới</span></Link>
        <button type="button" className="ed-save" onClick={save} disabled={!dirty || saving} title="Lưu (Ctrl+S)">Lưu</button>
      </header>

      <nav className="ed-rail" role="tablist" aria-label="Các phần của thiệp" ref={rail}>
        {TABS.map((t) => (
          <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={20} />
            <span>{t.label}</span>
            {needsAttention(t.id, draft) && <i className="ed-dot" aria-label="Còn thiếu" />}
          </button>
        ))}
      </nav>

      <main className="ed-body" key={tab}>
        <div className="ed-body-h">
          <h2>{current.label}</h2>
          <p>{current.desc}</p>
        </div>
        {tab === "template" && <TemplatePanel {...panelProps} />}
        {tab === "couple" && <CouplePanel {...panelProps} />}
        {tab === "events" && <EventsPanel {...panelProps} />}
        {tab === "photos" && <PhotosPanel {...panelProps} />}
        {tab === "content" && <ContentPanel {...panelProps} />}
        {tab === "gift" && <GiftPanel {...panelProps} />}
        {tab === "sections" && <SectionsPanel {...panelProps} />}
        {tab === "guests" && <GuestsPanel {...panelProps} />}
        {tab === "share" && <SharePanel {...panelProps} />}
        <div className="ed-pager">
          {prevTab ? <button type="button" className="ed-btn ghost" onClick={() => setTab(prevTab.id)}><Icon name="back" size={16} />{prevTab.label}</button> : <span />}
          {nextTab && <button type="button" className="ed-btn" onClick={() => setTab(nextTab.id)}>Tiếp: {nextTab.label}<Icon name="chevron" size={16} /></button>}
        </div>
      </main>

      <aside className={`ed-prev ${previewOpen ? "open" : ""}`} aria-label="Xem trước thiệp">
        <div className="ed-prev-bar">
          <div className="ed-seg" role="group" aria-label="Xem phần nào">
            <button type="button" aria-pressed={!showCover} onClick={() => setShowCover(false)}>Bên trong</button>
            <button type="button" aria-pressed={showCover} onClick={() => setShowCover(true)}>Bìa</button>
          </div>
          <a href={`/${draft.slug}`} target="_blank" rel="noopener" className="ed-prev-open">Mở bản thật ↗</a>
          <button type="button" className="ed-icon-btn ed-prev-close" aria-label="Đóng xem trước" onClick={() => setPreviewOpen(false)}><Icon name="close" size={20} /></button>
        </div>
        <div className="phone">
          <div className="phone-screen">
            <InvitationView key={showCover ? "cover" : "open"} data={publicDraft} wishes={[]} mode="preview" startOpened={!showCover} embedded />
          </div>
        </div>
      </aside>
      <button type="button" className="ed-fab" onClick={() => setPreviewOpen(true)}><Icon name="eye" size={18} />Xem trước</button>
    </div>
  );
}
