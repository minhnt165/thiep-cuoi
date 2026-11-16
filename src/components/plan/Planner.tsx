"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import type { Guest, Invitation, Rsvp } from "@/lib/schema";
import { type Plan, vnToday } from "@/lib/plan";
import { api, ApiError } from "@/lib/client/api";
import { useAuth, type AuthMode } from "@/lib/client/auth";
import { AccountLine, ClaimScreen, DeniedScreen, LoadingScreen, LoginScreen } from "@/components/auth/AuthScreens";
import { readKey, rememberKey } from "@/lib/client/edit-key";
import { dotDate, weekdayLabel } from "@/lib/dates";
import { THEMES, themeVars } from "@/lib/templates";
import { Ornament } from "@/components/invitation/Corner";
import { Icon, type IconName } from "./icons";
import type { PageProps, TabId, Update } from "./ui";
import { Overview } from "./Overview";
import { Tasks } from "./Tasks";
import { Budget } from "./Budget";
import { Guests } from "./Guests";
import { Gifts } from "./Gifts";

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: "overview", label: "Tổng quan", icon: "home" },
  { id: "tasks", label: "Công việc", icon: "tasks" },
  { id: "budget", label: "Chi phí", icon: "wallet" },
  { id: "guests", label: "Khách mời", icon: "users" },
  { id: "gifts", label: "Tiền mừng", icon: "envelope" },
];

function tabFromHash(): TabId {
  const h = window.location.hash.slice(1);
  return TABS.some((t) => t.id === h) ? (h as TabId) : "overview";
}

/** Dùng chung cho kế hoạch và danh sách khách: sửa trên bản sao rồi thay state */
function useDraft<T>(): [T | null, (v: T) => void, Update<T>] {
  const [value, setValue] = useState<T | null>(null);
  const update = useCallback<Update<T>>((fn) => {
    setValue((v) => {
      if (v === null) return v;
      const next = structuredClone(v);
      fn(next);
      return next;
    });
  }, []);
  return [value, setValue, update];
}

export function Planner({ slug, authMode = "off" }: { slug: string; authMode?: AuthMode }) {
  const search = useSearchParams();
  const [key, setKey] = useState<string>(() => {
    const fromUrl = search.get("key");
    if (fromUrl) {
      rememberKey(slug, fromUrl);
      return fromUrl;
    }
    return readKey(slug);
  });
  useEffect(() => {
    if (search.get("key")) window.history.replaceState(null, "", `/plan/${slug}${window.location.hash}`);
  }, [search, slug]);

  const [inv, setInv] = useState<Invitation | null>(null);
  const [plan, setPlanValue, setPlan] = useDraft<Plan>();
  const [guests, setGuestsValue, setGuests] = useDraft<Guest[]>();
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loadErr, setLoadErr] = useState("");
  const [errCode, setErrCode] = useState("");
  const [reload, setReload] = useState(0);
  const session = useAuth(authMode);
  const authOn = authMode !== "off";
  const [tab, setTab] = useState<TabId>(tabFromHash);
  const [today] = useState(() => vnToday());

  // Bản đã lưu trên server (JSON) để biết còn gì chưa lưu
  const [savedPlan, setSavedPlan] = useState("");
  const [savedGuests, setSavedGuests] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const queue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    if (authOn ? !session.email : !key) return;
    Promise.all([api.load(slug, key), api.plan(slug, key), api.rsvps(slug, key)])
      .then(([i, p, r]) => {
        setInv(i);
        setPlanValue(p);
        setGuestsValue(i.guests);
        setRsvps(r);
        setSavedPlan(JSON.stringify(p));
        setSavedGuests(JSON.stringify(i.guests));
        setLoadErr("");
        setErrCode("");
      })
      .catch((e) => {
        setInv(null);
        setLoadErr((e as Error).message);
        setErrCode(e instanceof ApiError ? e.code : "");
      });
  }, [slug, key, authOn, session.email, reload, setPlanValue, setGuestsValue]);

  useEffect(() => {
    const h = () => setTab(tabFromHash());
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const planJson = plan ? JSON.stringify(plan) : "";
  const guestsJson = guests ? JSON.stringify(guests) : "";
  const dirty = (plan !== null && planJson !== savedPlan) || (guests !== null && guestsJson !== savedGuests);

  // Tự lưu sau khi ngừng gõ 0,8 giây. Các lần lưu xếp hàng để không ghi đè lẫn nhau.
  useEffect(() => {
    if (!dirty || (!authOn && !key) || !plan || !guests) return;
    const t = setTimeout(() => {
      queue.current = queue.current.then(async () => {
        setSaving(true);
        try {
          if (planJson !== savedPlan) {
            await api.savePlan(slug, plan, key);
            setSavedPlan(planJson);
          }
          if (guestsJson !== savedGuests) {
            await api.saveGuests(slug, guests, key);
            setSavedGuests(guestsJson);
          }
          setSaveErr("");
        } catch (e) {
          setSaveErr((e as Error).message);
        } finally {
          setSaving(false);
        }
      });
    }, 800);
    return () => clearTimeout(t);
  }, [dirty, authOn, key, slug, plan, guests, planJson, guestsJson, savedPlan, savedGuests]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // Màu, chữ, họa tiết theo mẫu thiệp đang chọn
  const themeStyle = useMemo(() => {
    if (!inv) return undefined;
    return { ...themeVars(THEMES[inv.template], inv.accent) } as CSSProperties;
  }, [inv]);

  const go = useCallback((t: TabId) => {
    window.location.hash = t;
    window.scrollTo({ top: 0 });
  }, []);

  const keyInput = useRef<HTMLInputElement>(null);
  function submitKey(e: FormEvent) {
    e.preventDefault();
    let v = keyInput.current?.value.trim() ?? "";
    // Dán cả link chỉnh sửa cũng được
    const m = /[?&]key=([^&#\s]+)/.exec(v);
    if (m) v = decodeURIComponent(m[1]);
    if (!v) return;
    rememberKey(slug, v);
    setLoadErr("");
    setKey(v);
  }

  if (authOn) {
    if (!session.ready) return <LoadingScreen />;
    if (!session.email || errCode === "login") return <LoginScreen session={session} title={`Quản lý cưới /${slug}`} />;
    if (errCode === "claim") return <ClaimScreen slug={slug} session={session} initialKey={key} onDone={() => setReload((n) => n + 1)} />;
    if (loadErr) return <DeniedScreen session={session} message={loadErr} />;
  }

  if (!authOn && (!key || loadErr)) {
    return (
      <main className="ed-gate">
        <form onSubmit={submitKey}>
          <h1 style={{ fontSize: 18, margin: 0 }}>Quản lý cưới /{slug}</h1>
          <p className="hint">{loadErr || "Trình duyệt này chưa có khóa sửa của thiệp."} Dán link chỉnh sửa hoặc khóa sửa vào đây.</p>
          <input ref={keyInput} className="f" placeholder="Khóa sửa hoặc link chỉnh sửa" style={{ padding: 10, border: "1px solid var(--ui-line)", borderRadius: 8 }} />
          <button type="submit" className="ed-save">Mở</button>
          <Link href="/" className="hint">Về trang chủ</Link>
        </form>
      </main>
    );
  }

  if (!inv || !plan || !guests) {
    return (
      <div className="pl pl-loading" aria-busy="true">
        <aside className="pl-nav"><span className="sk" style={{ height: 40 }} /><span className="sk" /><span className="sk" /><span className="sk" /></aside>
        <main className="pl-main"><div className="pl-body"><span className="sk" style={{ height: 180 }} /><span className="sk" style={{ height: 120 }} /></div></main>
      </div>
    );
  }

  const theme = THEMES[inv.template];
  const statusKind = saveErr ? "err" : saving ? "busy" : dirty ? "busy" : "ok";
  const status = saveErr ? `Lỗi lưu: ${saveErr}` : saving ? "Đang lưu…" : dirty ? "Chưa lưu" : "Đã lưu";
  const props: PageProps = { inv, plan, setPlan, guests, setGuests, rsvps, today, go };
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div className={`pl t-${theme.id}`} style={themeStyle}>
      <aside className="pl-nav">
        <div className="pl-brand">
          <span className="pl-brand-orn" aria-hidden="true"><Ornament theme={theme} /></span>
          <small>Quản lý cưới</small>
          <b>{inv.groom.shortName} <em>&amp;</em> {inv.bride.shortName}</b>
          <span>{weekdayLabel(inv.mainEvent.date)}, {dotDate(inv.mainEvent.date)}</span>
        </div>
        <nav aria-label="Quản lý cưới">
          {TABS.map((t) => (
            <a key={t.id} href={`#${t.id}`} aria-current={tab === t.id ? "page" : undefined} onClick={(e) => { e.preventDefault(); go(t.id); }}>
              <Icon name={t.icon} size={20} />
              <span>{t.label}</span>
            </a>
          ))}
        </nav>
        <div className="pl-links">
          <Link href={`/edit/${inv.slug}`}><Icon name="edit" size={16} />Sửa thiệp</Link>
          <a href={`/${inv.slug}`} target="_blank" rel="noopener"><Icon name="eye" size={16} />Xem thiệp</a>
          <AccountLine session={session} />
        </div>
      </aside>
      <main className="pl-main">
        <header className="pl-top">
          <div>
            <small className="pl-top-sub">{inv.groom.shortName} &amp; {inv.bride.shortName}</small>
            <h1>{current.label}</h1>
          </div>
          <span className={`pl-save ${statusKind}`} role="status"><i aria-hidden="true" />{status}</span>
          <Link className="pl-top-act" href={`/edit/${inv.slug}`} aria-label="Sửa thiệp"><Icon name="edit" /></Link>
        </header>
        <div className="pl-body" key={tab}>
          {tab === "overview" && <Overview {...props} />}
          {tab === "tasks" && <Tasks {...props} />}
          {tab === "budget" && <Budget {...props} />}
          {tab === "guests" && <Guests {...props} />}
          {tab === "gifts" && <Gifts {...props} />}
        </div>
      </main>
    </div>
  );
}
