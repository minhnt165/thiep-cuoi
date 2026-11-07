"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Invitation } from "@/lib/schema";
import { toPublic } from "@/lib/schema";
import { api } from "@/lib/client/api";
import { readKey, rememberKey } from "@/lib/client/edit-key";
import { Invitation as InvitationView } from "@/components/invitation/Invitation";
import { ContentPanel, CouplePanel, EventsPanel, GiftPanel, GuestsPanel, PhotosPanel, SectionsPanel, SharePanel, TemplatePanel, type Patch } from "./panels";
import "./editor.css";

const TABS = [
  ["template", "Mẫu"],
  ["couple", "Cặp đôi"],
  ["events", "Sự kiện"],
  ["photos", "Ảnh"],
  ["content", "Nội dung"],
  ["gift", "Mừng cưới"],
  ["sections", "Hiển thị"],
  ["guests", "Khách"],
  ["share", "Chia sẻ"],
] as const;
type Tab = (typeof TABS)[number][0];

export function Editor({ slug }: { slug: string }) {
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
  const [loadErr, setLoadErr] = useState("");
  const keyInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!key) return;
    api.load(slug, key)
      .then((inv) => {
        setDraft(inv);
        setSaved(JSON.stringify(inv));
        setLoadErr("");
      })
      .catch((e) => setLoadErr((e as Error).message));
  }, [slug, key]);

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
    if (!draft || !key) return;
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

  function submitKey(e: FormEvent) {
    e.preventDefault();
    const v = keyInput.current?.value.trim() ?? "";
    if (!v) return;
    rememberKey(slug, v);
    setKey(v);
  }

  if (!key || loadErr) {
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

  const panelProps = { d: draft, patch, editKey: key };

  return (
    <div className="ed">
      <section className="ed-side">
        <header className="ed-top">
          <Link href="/">← Trang chủ</Link>
          <h1>{draft.groom.shortName} &amp; {draft.bride.shortName} · /{draft.slug}</h1>
          <span className={`ed-status ${status.err ? "err" : ""}`}>{status.text || (dirty ? "Chưa lưu" : "")}</span>
          <button type="button" className="ed-save" onClick={save} disabled={!dirty && status.text !== "Đang lưu…"}>Lưu</button>
        </header>
        <nav className="ed-tabs" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        <div className="ed-body">
          {tab === "template" && <TemplatePanel {...panelProps} />}
          {tab === "couple" && <CouplePanel {...panelProps} />}
          {tab === "events" && <EventsPanel {...panelProps} />}
          {tab === "photos" && <PhotosPanel {...panelProps} />}
          {tab === "content" && <ContentPanel {...panelProps} />}
          {tab === "gift" && <GiftPanel {...panelProps} />}
          {tab === "sections" && <SectionsPanel {...panelProps} />}
          {tab === "guests" && <GuestsPanel {...panelProps} />}
          {tab === "share" && <SharePanel {...panelProps} />}
        </div>
      </section>
      <aside className="ed-prev">
        <div className="ed-prev-bar">
          <span>Xem trước</span>
          <label><input type="checkbox" checked={showCover} onChange={(e) => setShowCover(e.target.checked)} /> Hiện bìa</label>
          <a href={`/${draft.slug}`} target="_blank" rel="noopener" style={{ marginLeft: "auto" }}>Mở bản thật ↗</a>
        </div>
        <div className="phone">
          <div className="phone-screen">
            <InvitationView key={showCover ? "cover" : "open"} data={publicDraft} wishes={[]} mode="preview" startOpened={!showCover} embedded />
          </div>
        </div>
      </aside>
    </div>
  );
}
