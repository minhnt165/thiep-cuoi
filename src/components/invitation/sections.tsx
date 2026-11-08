"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import type { GiftAccount, PublicInvitation, Rsvp, WeddingEvent, Wish } from "@/lib/schema";
import type { Theme } from "@/lib/templates";
import { lunarLabel } from "@/lib/lunar";
import { countdown, dotDate, formatWishTime, googleCalendarUrl, mapsUrl, monthGrid, parseYmd, pad, toVnDate, weekdayLabel } from "@/lib/dates";
import { Divider, IconCalendar, IconCopy, IconPin, WaxSeal } from "@/components/ornaments";
import { vietQrUrl } from "@/lib/banks";
import { nameLengthClass } from "@/lib/names";
import { Corners } from "./Corner";
import { Photo } from "./Photo";
import { Modal } from "./Modal";

const MONTHS = ["", "Tháng 01", "Tháng 02", "Tháng 03", "Tháng 04", "Tháng 05", "Tháng 06", "Tháng 07", "Tháng 08", "Tháng 09", "Tháng 10", "Tháng 11", "Tháng 12"];

function Title({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 className="sec-title">{children}</h2>
      <Divider className="divider" />
    </>
  );
}

function BigDate({ ymd }: { ymd: string }) {
  const { y, m, d } = parseYmd(ymd);
  return (
    <div className="bigdate">
      <span className="d">{pad(d)}</span>
      <span>
        <span className="m">{MONTHS[m]}</span>
        <br />
        <span className="y">{y}</span>
      </span>
    </div>
  );
}

/* ---------- Save the date ---------- */
export function SaveTheDate({ data, theme }: { data: PublicInvitation; theme: Theme }) {
  const [p1, p2] = data.photos.saveTheDate;
  const initials = `${data.groom.shortName.slice(0, 1)}&${data.bride.shortName.slice(0, 1)}`;
  return (
    <section className={`sec std reveal ${nameLengthClass(data)}`} id="s-std">
      <Corners theme={theme} where={["tl", "br"]} />
      <p className="eyebrow">{data.texts.saveTheDate}</p>
      {theme.cover === "envelope" ? (
        <div className="std-env">
          <div className="std-env-back" />
          <Photo src={p1 ?? data.photos.cover} alt="Ảnh cưới" />
          <div className="std-env-front" />
          <span className="std-env-seal"><WaxSeal text={initials} color={theme.colors.gold} ink={theme.colors.accent} /></span>
        </div>
      ) : (
        <div className="std-photos">
          <div className="std-photo std-p1"><Photo src={p1 ?? data.photos.cover} alt="Chú rể" /></div>
          <div className="std-label std-l1"><p className="eyebrow">Cô dâu</p><p className="nm">{data.bride.shortName}</p></div>
          <div className="std-photo std-p2"><Photo src={p2} alt="Cô dâu" /></div>
          <div className="std-label std-l2"><p className="eyebrow">Chú rể</p><p className="nm">{data.groom.shortName}</p></div>
        </div>
      )}
      <h2 className="std-names">
        {data.groom.shortName}
        <span className="amp">&amp;</span>
        {data.bride.shortName}
      </h2>
    </section>
  );
}

/* ---------- Thông tin lễ cưới ---------- */
/** Có địa điểm để chỉ đường không (tên nơi, địa chỉ hoặc link map) */
function hasPlace(ev: WeddingEvent): boolean {
  return Boolean(ev.venue || ev.address || ev.mapUrl);
}

function placeUrl(ev: WeddingEvent): string {
  return mapsUrl(`${ev.venue} ${ev.address}`.trim(), ev.mapUrl);
}

function EventBlock({ ev }: { ev: WeddingEvent }) {
  return (
    <div className="event">
      <p className="t">{ev.title} được cử hành tại {ev.venue || "…"}</p>
      {ev.address && <p className="venue">{ev.address}</p>}
      <div className="when">
        <span>Vào lúc {ev.time}</span>
        <span>{weekdayLabel(ev.date)}</span>
      </div>
      <BigDate ymd={ev.date} />
      <p className="lunar">(Tức {lunarLabel(ev.date).toLowerCase()})</p>
    </div>
  );
}

interface Place {
  titles: string[];
  venue: string;
  address: string;
  url: string;
}

const MAX_PLACES = 3;

/**
 * Gom tiệc chính và các lễ theo địa điểm: cùng nơi thì gộp tên, khác nơi thì
 * mỗi nơi một map (vu quy nhà gái, thành hôn nhà trai, tiệc ở nhà hàng…).
 * Tối đa 3 nơi để phần chỉ đường không dài quá.
 */
function groupPlaces(events: WeddingEvent[]): Place[] {
  const out: Place[] = [];
  const byKey = new Map<string, Place>();
  for (const ev of events) {
    if (!hasPlace(ev)) continue;
    const key = (ev.mapUrl || `${ev.venue}|${ev.address}`).toLowerCase().replace(/\s+/g, " ").trim();
    const found = byKey.get(key);
    if (found) {
      if (!found.titles.includes(ev.title)) found.titles.push(ev.title);
      continue;
    }
    if (out.length >= MAX_PLACES) continue;
    const p: Place = { titles: [ev.title], venue: ev.venue, address: ev.address, url: placeUrl(ev) };
    byKey.set(key, p);
    out.push(p);
  }
  return out;
}

export function Family({ data }: { data: PublicInvitation }) {
  return (
    <section className="sec reveal" id="s-family">
      <div className="panel">
        <Title>Thông tin lễ cưới</Title>
        <div className="parents">
          <div>
            <p className="side">Nhà trai</p>
            <p className="who">{data.groom.father}</p>
            <p className="who">{data.groom.mother}</p>
            <p className="addr">{data.groom.address}</p>
          </div>
          <div>
            <p className="side">Nhà gái</p>
            <p className="who">{data.bride.father}</p>
            <p className="who">{data.bride.mother}</p>
            <p className="addr">{data.bride.address}</p>
          </div>
        </div>
        <p className="announce">{data.texts.announce}</p>
        <div className="couple">
          <p className="nm">{data.groom.fullName}</p>
          {data.groom.role && <p className="role">{data.groom.role}</p>}
          <p className="amp">&amp;</p>
          <p className="nm">{data.bride.fullName}</p>
          {data.bride.role && <p className="role">{data.bride.role}</p>}
        </div>
        {data.events.map((ev) => (
          <EventBlock key={ev.id} ev={ev} />
        ))}
      </div>
    </section>
  );
}

/* ---------- Tiệc cưới: đếm ngược, lịch, RSVP ---------- */
/** Giây hiện tại; null khi render ở server để HTML server và client khớp nhau */
const tick = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};
function useNowSec(): number | null {
  return useSyncExternalStore(tick, () => Math.floor(Date.now() / 1000), () => null);
}

/** Một ô số đếm ngược: đổi key theo giá trị để số mới lật xuống (animation khi gắn) */
function Tick({ value }: { value: string }) {
  return (
    <b className="tick">
      <span key={value}>{value}</span>
    </b>
  );
}

function Countdown({ target }: { target: Date }) {
  const now = useNowSec();
  const t = now === null ? null : countdown(target, new Date(now * 1000));
  if (t?.passed) return <p className="cd-title">Ngày vui đã diễn ra</p>;
  const v = (n?: number) => (n === undefined ? "--" : pad(n));
  return (
    <>
      <p className="cd-title">Cùng đếm ngược</p>
      <div className="cd" aria-live="off">
        <div><Tick value={t ? String(t.days) : "--"} /><span>Ngày</span></div>
        <div><Tick value={v(t?.hours)} /><span>Giờ</span></div>
        <div><Tick value={v(t?.minutes)} /><span>Phút</span></div>
        <div><Tick value={v(t?.seconds)} /><span>Giây</span></div>
      </div>
    </>
  );
}

function Calendar({ ymd }: { ymd: string }) {
  const g = monthGrid(ymd);
  const { d } = parseYmd(ymd);
  return (
    <div className="cal">
      <p className="cal-h">Tháng {g.month} / {g.year}</p>
      <div className="cal-g">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((w) => (
          <span key={w} className="w">{w}</span>
        ))}
        {g.cells.map((c, i) => (
          <span key={i} className={`d ${c === d ? "on" : ""}`}>{c ?? ""}</span>
        ))}
      </div>
    </div>
  );
}

export type RsvpInput = Omit<Rsvp, "id" | "createdAt" | "invitedAs">;

export function Party({ data, onRsvp, guest = "" }: { data: PublicInvitation; onRsvp?: (input: RsvpInput) => Promise<void>; guest?: string }) {
  const ev = data.mainEvent;
  const [showForm, setShowForm] = useState(false);
  const [done, setDone] = useState<RsvpInput | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const target = toVnDate(ev.date, ev.time);
  const places = groupPlaces([ev, ...data.events]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const input: RsvpInput = {
      name: String(f.get("name") ?? "").trim(),
      attending: f.get("attending") === "yes",
      guests: Number(f.get("guests") ?? 1),
      side: f.get("side") === "bride" ? "bride" : "groom",
      note: String(f.get("note") ?? "").trim(),
    };
    if (!input.name) {
      setErr("Nhập họ tên để gia đình biết ai sẽ đến.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      await onRsvp?.(input);
      setDone(input);
    } catch {
      setErr("Gửi chưa được, bạn thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="sec reveal" id="s-party">
      <div className="panel">
        <Title>Thông tin tiệc cưới</Title>
        <p className="announce announce-mt">{ev.title} sẽ diễn ra vào lúc</p>
        <div className="when">
          <span>{ev.time}</span>
          <span>{weekdayLabel(ev.date)}</span>
        </div>
        <BigDate ymd={ev.date} />
        <p className="lunar">(Tức {lunarLabel(ev.date).toLowerCase()})</p>
        {data.receptionTime && (
          <div className="times">
            <div><p className="k">Đón khách</p><p className="v">{data.receptionTime}</p></div>
            <div><p className="k">Khai tiệc</p><p className="v">{ev.time}</p></div>
          </div>
        )}
        <Countdown target={target} />
        <Calendar ymd={ev.date} />
        <div className="actions">
          <a className="link" href={googleCalendarUrl({ title: `${ev.title} ${data.groom.shortName} & ${data.bride.shortName}`, ymd: ev.date, hm: ev.time, location: `${ev.venue}, ${ev.address}` })} target="_blank" rel="noopener">
            <IconCalendar /> Thêm vào lịch
          </a>
        </div>
        {!done && (
          <div className="actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm((v) => !v)} aria-expanded={showForm}>
              Xác nhận tham dự
            </button>
          </div>
        )}
        {showForm && !done && (
          <form className="frm" onSubmit={submit} noValidate>
            <input name="name" placeholder="Họ và tên của bạn" autoComplete="name" defaultValue={guest} onInput={() => setErr("")} />
            <div className="seg" role="radiogroup" aria-label="Tham dự">
              <label><input type="radio" name="attending" value="yes" defaultChecked /><span>Mình sẽ đến</span></label>
              <label><input type="radio" name="attending" value="no" /><span>Rất tiếc, không đến được</span></label>
            </div>
            <div className="row2">
              <label className="fl">Số người
                <select name="guests" defaultValue="1">{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}</select>
              </label>
              <label className="fl">Khách của
                <select name="side" defaultValue="groom"><option value="groom">Nhà trai</option><option value="bride">Nhà gái</option></select>
              </label>
            </div>
            <input name="note" placeholder="Lời nhắn cho gia đình (không bắt buộc)" />
            {err && <p className="err">{err}</p>}
            <button type="submit" className="btn" disabled={busy}>{busy ? "Đang gửi…" : "Gửi xác nhận"}</button>
          </form>
        )}
        {done && (
          <div className="done">
            <p className="script">{done.attending ? "Hẹn gặp bạn" : "Cảm ơn bạn"}</p>
            <p>{done.attending ? `Đã ghi nhận ${done.name}, ${done.guests} người.` : `Đã ghi nhận ${done.name} không đến được. Cảm ơn bạn đã báo cho gia đình.`}</p>
          </div>
        )}
      </div>
      {places.length > 0 && (
        <div className="venue">
          {places.map((p) => (
            <div className="place" key={p.url}>
              <p className="t">{p.titles.join(" · ")} sẽ tổ chức tại</p>
              {p.venue && <p className="n">{p.venue}</p>}
              {p.address && <p className="a">{p.address}</p>}
              <div className="actions">
                <a className="link" href={p.url} target="_blank" rel="noopener"><IconPin /> Chỉ đường</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- Dress code ---------- */
export function DressCode({ data }: { data: PublicInvitation }) {
  if (!data.dressCode.length) return null;
  return (
    <section className="sec reveal" id="s-dress">
      <Title>Dress code</Title>
      <p className="eyebrow" style={{ marginTop: 10 }}>Trang phục dự tiệc</p>
      <div className="swatches">
        {data.dressCode.map((c, i) => (
          <i key={i} style={{ background: c }} title={c} />
        ))}
      </div>
    </section>
  );
}

/* ---------- Lịch trình ---------- */
export function Timeline({ data }: { data: PublicInvitation }) {
  if (!data.timeline.length) return null;
  return (
    <section className="sec reveal" id="s-timeline">
      <div className="panel">
        <Title>Lịch trình ngày cưới</Title>
        <ol className="tl">
          {data.timeline.map((t, i) => (
            <li key={i} style={{ "--i": i } as React.CSSProperties}>
              <span className="t">{t.time}</span>
              <span className="dot" />
              <span className="n">{t.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Chuyện tình ---------- */
export function Story({ data }: { data: PublicInvitation }) {
  if (!data.story.length) return null;
  return (
    <section className="sec reveal" id="s-story">
      <Title>Chuyện của chúng mình</Title>
      <div className="story">
        {data.story.map((s, i) => (
          <div className="story-i" key={i} style={{ "--i": i } as React.CSSProperties}>
            <span className="story-y">{s.label}</span>
            <div>
              {s.photo && <Photo src={s.photo} alt={s.title} />}
              <h3>{s.title}</h3>
              {s.text && <p>{s.text}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Sổ lưu bút ---------- */
export function Guestbook({ wishes, onAdd }: { wishes: Wish[]; onAdd?: (name: string, message: string) => Promise<void> }) {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const message = String(f.get("message") ?? "").trim();
    if (!name || !message) {
      setErr("Nhập tên và lời chúc trước khi gửi.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      await onAdd?.(name, message);
      formRef.current?.reset();
    } catch {
      setErr("Gửi chưa được, bạn thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="sec reveal" id="s-wishes">
      <Title>Sổ lưu bút</Title>
      <form className="frm" ref={formRef} onSubmit={submit} noValidate>
        <input name="name" placeholder="Tên của bạn" autoComplete="name" onInput={() => setErr("")} />
        <textarea name="message" placeholder="Gửi lời chúc tới cô dâu chú rể" onInput={() => setErr("")} />
        {err && <p className="err">{err}</p>}
        <button type="submit" className="btn" disabled={busy}>{busy ? "Đang gửi…" : "Gửi lời chúc"}</button>
      </form>
      <div className="wishes">
        {wishes.map((w, i) => (
          <div className="wish" key={w.id} style={{ "--i": Math.min(i, 8) } as React.CSSProperties}>
            <div className="h"><b>{w.name}</b><time dateTime={w.createdAt}>{formatWishTime(w.createdAt)}</time></div>
            <p>{w.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Hộp quà mừng ---------- */
/* eslint-disable @next/next/no-img-element */
function GiftCard({ g, delay = 0 }: { g: GiftAccount; delay?: number }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(g.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* trình duyệt không cho phép, người dùng tự chép */
    }
  }
  const qr = g.qrImage || (g.bankCode && g.accountNumber ? vietQrUrl(g.bankCode, g.accountNumber, g.holder) : "");
  return (
    <div className="gift" style={{ animationDelay: `${delay + 120}ms` }}>
      {g.label && <p className="side">{g.label}</p>}
      <div className="qr">
        {qr ? <img src={qr} alt={`Mã QR ${g.bank}`} loading="lazy" /> : <div className="qr-empty">Chưa có mã QR</div>}
      </div>
      <p className="bank">{g.bank}</p>
      <p className="acc">{g.accountNumber}</p>
      <p className="holder">{g.holder}</p>
      {g.accountNumber && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={copy}><IconCopy style={{ width: 14, height: 14 }} /> {copied ? "Đã sao chép" : "Sao chép số tài khoản"}</button>
      )}
    </div>
  );
}

/** Thời gian nắp hộp bật ra trước khi popup hiện (ms) */
const GIFT_POP_MS = 650;

export function Gift({ data }: { data: PublicInvitation }) {
  /** idle: hộp đóng · popping: nắp đang bật · open: popup đang mở */
  const [state, setState] = useState<"idle" | "popping" | "open">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  if (!data.gifts.length) return null;

  function pop() {
    if (state !== "idle") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("open");
      return;
    }
    setState("popping");
    timer.current = setTimeout(() => setState("open"), GIFT_POP_MS);
  }

  return (
    <section className="sec reveal" id="s-gift">
      <Title>Hộp quà mừng</Title>
      <button type="button" className={`giftbox is-${state}`} onClick={pop} aria-label="Mở hộp quà mừng" aria-haspopup="dialog">
        <svg viewBox="0 0 150 130" aria-hidden="true">
          <rect x="25" y="58" width="100" height="62" rx="6" fill="currentColor" opacity="0.9" />
          <rect x="68" y="58" width="14" height="62" fill="var(--gold)" />
          <g className="lid">
            <rect x="16" y="42" width="118" height="24" rx="5" fill="currentColor" />
            <rect x="68" y="42" width="14" height="24" fill="var(--gold)" />
            <path d="M75 42c-14-20-36-20-34-6 2 10 20 10 34 6Zm0 0c14-20 36-20 34-6-2 10-20 10-34 6Z" fill="none" stroke="var(--gold)" strokeWidth="4" strokeLinejoin="round" />
          </g>
        </svg>
        <span className="gift-sparks" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => <i key={i} style={{ "--a": `${-150 + i * 15}deg`, "--d": `${(i % 3) * 60}ms` } as React.CSSProperties} />)}
        </span>
      </button>
      <p className="gift-tap">Nhấn để mở</p>

      {state === "open" && (
        <Modal className="gift-modal" label="Hộp quà mừng" onClose={() => setState("idle")}>
          <div className="gift-sheet">
            <button type="button" className="gift-close" onClick={() => setState("idle")} aria-label="Đóng">×</button>
            <p className="script gift-title">Hộp quà mừng</p>
            <Divider className="divider" />
            <p className="gift-intro">{data.texts.giftIntro}</p>
            <div className={`gifts ${data.gifts.length > 1 ? "is-multi" : ""}`}>
              {data.gifts.map((g, i) => (
                <GiftCard key={g.id} g={g} delay={i * 90} />
              ))}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

/* ---------- Cuối ---------- */
export function Footer({ data }: { data: PublicInvitation }) {
  return (
    <footer className="sec end reveal">
      <p className="script big">Cảm ơn</p>
      <p className="thanks">{data.texts.thanks}</p>
      <p className="sig">{data.groom.shortName} &amp; {data.bride.shortName}</p>
      <p className="eyebrow" style={{ marginTop: 10 }}>{dotDate(data.mainEvent.date)}</p>
    </footer>
  );
}
