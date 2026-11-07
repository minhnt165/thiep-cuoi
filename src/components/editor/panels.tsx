"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, type ChangeEvent } from "react";
import type { Invitation, Rsvp, SectionId, Wish } from "@/lib/schema";
import { makeId } from "@/lib/schema";
import { THEME_LIST } from "@/lib/templates";
import { api } from "@/lib/client/api";
import { formatWishTime } from "@/lib/dates";

export type Patch = (fn: (d: Invitation) => void) => void;

interface PanelProps {
  d: Invitation;
  patch: Patch;
  editKey: string;
}

const SECTION_LABELS: Record<SectionId, string> = {
  saveTheDate: "Save the date (ảnh + tên)",
  family: "Thông tin lễ cưới (bố mẹ, tên, lễ)",
  album: "Album ảnh",
  party: "Thông tin tiệc (đếm ngược, lịch, xác nhận)",
  dressCode: "Dress code",
  timeline: "Lịch trình ngày cưới",
  story: "Chuyện của chúng mình",
  guestbook: "Sổ lưu bút",
  gift: "Hộp quà mừng",
};

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="f">
      {label}
      {children}
    </label>
  );
}

/** Nút tải file: gọi API upload rồi trả URL */
function Upload({ slug, editKey, accept, multiple, onDone, label }: { slug: string; editKey: string; accept: string; multiple?: boolean; onDone: (urls: string[]) => void; label: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function change(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    setErr("");
    try {
      const urls: string[] = [];
      for (const f of files) urls.push(await api.upload(slug, editKey, f));
      onDone(urls);
    } catch (er) {
      setErr((er as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="row">
      <label className="up">
        <input type="file" accept={accept} multiple={multiple} onChange={change} disabled={busy} />
        {busy ? "Đang tải…" : label}
      </label>
      {err && <span className="hint" style={{ color: "var(--ui-danger)" }}>{err}</span>}
    </div>
  );
}

/* ---------- Mẫu ---------- */
export function TemplatePanel({ d, patch, editKey }: PanelProps) {
  return (
    <>
      <p className="ed-h">Chọn mẫu</p>
      <div className="tpl-pick">
        {THEME_LIST.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={d.template === t.id}
            style={{ "--sw": t.colors.outer, "--sw-card": t.colors.bg } as React.CSSProperties}
            onClick={() => patch((x) => { x.template = t.id; })}
          >
            <span className="sw"><i /></span>
            <b>{t.name}</b>
            <span>{t.tagline}</span>
          </button>
        ))}
      </div>
      <p className="hint">Đổi mẫu không mất nội dung đã nhập. Link đã gửi cho khách vẫn giữ nguyên.</p>

      <p className="ed-h">Màu nhấn</p>
      <div className="row">
        <F label="Màu riêng (để trống = màu của mẫu)">
          <input type="color" value={d.accent || THEME_LIST.find((t) => t.id === d.template)!.colors.accent} onChange={(e) => patch((x) => { x.accent = e.target.value; })} />
        </F>
        {d.accent && <button type="button" className="btn2" onClick={() => patch((x) => { x.accent = ""; })}>Dùng màu mẫu</button>}
      </div>

      <p className="ed-h">Nhạc nền</p>
      <div className="fs">
        {d.music ? (
          <div className="row">
            <audio controls src={d.music} style={{ height: 36, maxWidth: "100%" }} />
            <button type="button" className="btn2 danger" onClick={() => patch((x) => { x.music = ""; })}>Bỏ nhạc</button>
          </div>
        ) : (
          <p className="hint">Chưa có nhạc. Nhạc tự phát khi khách bấm Mở thiệp.</p>
        )}
        <Upload slug={d.slug} editKey={editKey} accept="audio/mpeg,audio/mp4,audio/ogg" label="Tải file MP3" onDone={([u]) => patch((x) => { x.music = u; })} />
        <F label="Hoặc dán link file nhạc">
          <input value={d.music} onChange={(e) => patch((x) => { x.music = e.target.value; })} placeholder="https://…/nhac.mp3" />
        </F>
      </div>
    </>
  );
}

/* ---------- Cặp đôi ---------- */
function PersonFields({ d, patch, who }: PanelProps & { who: "groom" | "bride" }) {
  const p = d[who];
  const set = (k: keyof typeof p) => (e: ChangeEvent<HTMLInputElement>) => patch((x) => { x[who][k] = e.target.value; });
  return (
    <fieldset className="fs">
      <legend>{who === "groom" ? "Chú rể" : "Cô dâu"}</legend>
      <div className="g2">
        <F label="Họ và tên"><input value={p.fullName} onChange={set("fullName")} /></F>
        <F label="Tên gọi (hiện ở bìa)"><input value={p.shortName} onChange={set("shortName")} /></F>
      </div>
      <F label="Vai (Trưởng nam, Út nữ…)"><input value={p.role} onChange={set("role")} /></F>
      <div className="g2">
        <F label="Bố"><input value={p.father} onChange={set("father")} placeholder="Ông …" /></F>
        <F label="Mẹ"><input value={p.mother} onChange={set("mother")} placeholder="Bà …" /></F>
      </div>
      <F label="Địa chỉ gia đình"><input value={p.address} onChange={set("address")} /></F>
    </fieldset>
  );
}

export function CouplePanel(props: PanelProps) {
  return (
    <>
      <PersonFields {...props} who="groom" />
      <PersonFields {...props} who="bride" />
    </>
  );
}

/* ---------- Sự kiện ---------- */
function EventFields({ d, patch, index }: PanelProps & { index: number | "main" }) {
  const ev = index === "main" ? d.mainEvent : d.events[index];
  const set = (k: keyof typeof ev) => (e: ChangeEvent<HTMLInputElement>) =>
    patch((x) => { (index === "main" ? x.mainEvent : x.events[index])[k] = e.target.value; });
  return (
    <>
      <F label="Tên sự kiện"><input value={ev.title} onChange={set("title")} /></F>
      <div className="g2">
        <F label="Ngày"><input type="date" value={ev.date} onChange={set("date")} /></F>
        <F label="Giờ"><input type="time" value={ev.time} onChange={set("time")} /></F>
      </div>
      <F label="Địa điểm"><input value={ev.venue} onChange={set("venue")} /></F>
      <F label="Địa chỉ"><input value={ev.address} onChange={set("address")} /></F>
      <F label="Link Google Maps (không bắt buộc)"><input value={ev.mapUrl} onChange={set("mapUrl")} placeholder="https://maps.app.goo.gl/…" /></F>
    </>
  );
}

export function EventsPanel(props: PanelProps) {
  const { d, patch } = props;
  return (
    <>
      <fieldset className="fs">
        <legend>Tiệc chính (đếm ngược, lịch, xác nhận tham dự)</legend>
        <EventFields {...props} index="main" />
        <F label="Giờ đón khách">
          <input type="time" value={d.receptionTime} onChange={(e) => patch((x) => { x.receptionTime = e.target.value; })} />
        </F>
      </fieldset>

      <p className="ed-h">Các lễ khác (vu quy, thành hôn…)</p>
      {d.events.map((ev, i) => (
        <div className="item" key={ev.id}>
          <div className="item-h">
            <span>{ev.title || `Lễ ${i + 1}`}</span>
            <div className="row">
              <button type="button" className="btn2" disabled={i === 0} onClick={() => patch((x) => { [x.events[i - 1], x.events[i]] = [x.events[i], x.events[i - 1]]; })}>↑</button>
              <button type="button" className="btn2" disabled={i === d.events.length - 1} onClick={() => patch((x) => { [x.events[i + 1], x.events[i]] = [x.events[i], x.events[i + 1]]; })}>↓</button>
              <button type="button" className="btn2 danger" onClick={() => patch((x) => { x.events.splice(i, 1); })}>Xóa</button>
            </div>
          </div>
          <EventFields {...props} index={i} />
        </div>
      ))}
      <button type="button" className="btn2" onClick={() => patch((x) => { x.events.push({ id: makeId(), title: "Lễ thành hôn", date: x.mainEvent.date, time: "09:00", venue: "", address: "", mapUrl: "" }); })}>+ Thêm lễ</button>

      <p className="ed-h">Lịch trình ngày cưới</p>
      {d.timeline.map((t, i) => (
        <div className="row" key={i}>
          <input type="time" value={t.time} style={{ width: 110 }} className="f" onChange={(e) => patch((x) => { x.timeline[i].time = e.target.value; })} />
          <input value={t.title} style={{ flex: 1, minWidth: 140 }} onChange={(e) => patch((x) => { x.timeline[i].title = e.target.value; })} />
          <button type="button" className="btn2 danger" onClick={() => patch((x) => { x.timeline.splice(i, 1); })}>×</button>
        </div>
      ))}
      <button type="button" className="btn2" onClick={() => patch((x) => { x.timeline.push({ time: "12:00", title: "" }); })}>+ Thêm mốc</button>
    </>
  );
}

/* ---------- Ảnh ---------- */
function Thumb({ src, onRemove, onLeft, onRight }: { src: string; onRemove: () => void; onLeft?: () => void; onRight?: () => void }) {
  return (
    <div className="thumb">
      <img src={src} alt="" />
      <button type="button" onClick={onRemove} aria-label="Xóa ảnh">×</button>
      {onLeft && <button type="button" className="mv" onClick={onLeft} aria-label="Chuyển lên trước">‹</button>}
      {onRight && <button type="button" className="mv" onClick={onRight} aria-label="Chuyển ra sau">›</button>}
    </div>
  );
}

export function PhotosPanel({ d, patch, editKey }: PanelProps) {
  const img = "image/jpeg,image/png,image/webp";
  return (
    <>
      <fieldset className="fs">
        <legend>Ảnh bìa</legend>
        <p className="hint">Hiện trên bìa (mẫu Song Hỷ) và làm ảnh xem trước khi gửi link qua Zalo, Messenger.</p>
        {d.photos.cover && <div className="thumbs"><Thumb src={d.photos.cover} onRemove={() => patch((x) => { x.photos.cover = ""; })} /></div>}
        <Upload slug={d.slug} editKey={editKey} accept={img} label="Tải ảnh bìa" onDone={([u]) => patch((x) => { x.photos.cover = u; })} />
      </fieldset>
      <fieldset className="fs">
        <legend>Ảnh Save the date (2 ảnh: chú rể, cô dâu)</legend>
        <div className="thumbs">
          {d.photos.saveTheDate.map((p, i) => (
            <Thumb key={p + i} src={p} onRemove={() => patch((x) => { x.photos.saveTheDate.splice(i, 1); })} />
          ))}
        </div>
        <Upload slug={d.slug} editKey={editKey} accept={img} multiple label="Tải ảnh" onDone={(urls) => patch((x) => { x.photos.saveTheDate = [...x.photos.saveTheDate, ...urls].slice(0, 2); })} />
      </fieldset>
      <fieldset className="fs">
        <legend>Album ({d.photos.album.length} ảnh)</legend>
        <div className="thumbs">
          {d.photos.album.map((p, i) => (
            <Thumb
              key={p + i}
              src={p}
              onRemove={() => patch((x) => { x.photos.album.splice(i, 1); })}
              onLeft={i > 0 ? () => patch((x) => { [x.photos.album[i - 1], x.photos.album[i]] = [x.photos.album[i], x.photos.album[i - 1]]; }) : undefined}
              onRight={i < d.photos.album.length - 1 ? () => patch((x) => { [x.photos.album[i + 1], x.photos.album[i]] = [x.photos.album[i], x.photos.album[i + 1]]; }) : undefined}
            />
          ))}
        </div>
        <Upload slug={d.slug} editKey={editKey} accept={img} multiple label="Tải thêm ảnh" onDone={(urls) => patch((x) => { x.photos.album.push(...urls); })} />
        <p className="hint">Nên dùng ảnh dọc, mỗi ảnh dưới 8MB. 6–10 ảnh là vừa.</p>
      </fieldset>
    </>
  );
}

/* ---------- Nội dung ---------- */
export function ContentPanel({ d, patch, editKey }: PanelProps) {
  const t = d.texts;
  const set = (k: keyof typeof t) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => patch((x) => { x.texts[k] = e.target.value; });
  return (
    <>
      <fieldset className="fs">
        <legend>Câu chữ</legend>
        <F label="Lời chào trên bìa"><input value={t.coverGreeting} onChange={set("coverGreeting")} /></F>
        <F label="Tiêu đề phần ảnh"><input value={t.saveTheDate} onChange={set("saveTheDate")} /></F>
        <F label="Lời báo tin"><textarea value={t.announce} onChange={set("announce")} /></F>
        <F label="Lời cảm ơn cuối thiệp"><textarea value={t.thanks} onChange={set("thanks")} /></F>
        <F label="Lời dẫn hộp mừng cưới"><textarea value={t.giftIntro} onChange={set("giftIntro")} /></F>
      </fieldset>

      <fieldset className="fs">
        <legend>Dress code (màu trang phục)</legend>
        <div className="row">
          {d.dressCode.map((c, i) => (
            <span key={i} className="row" style={{ gap: 2 }}>
              <input type="color" value={c} onChange={(e) => patch((x) => { x.dressCode[i] = e.target.value; })} style={{ width: 44, height: 36, padding: 2, border: "1px solid var(--ui-line)", borderRadius: 8 }} />
              <button type="button" className="btn2 danger" onClick={() => patch((x) => { x.dressCode.splice(i, 1); })}>×</button>
            </span>
          ))}
          {d.dressCode.length < 6 && <button type="button" className="btn2" onClick={() => patch((x) => { x.dressCode.push("#888888"); })}>+ Màu</button>}
        </div>
        <p className="hint">Để trống thì phần Dress code tự ẩn.</p>
      </fieldset>

      <p className="ed-h">Chuyện của chúng mình</p>
      {d.story.map((s, i) => (
        <div className="item" key={i}>
          <div className="item-h">
            <span>Mốc {i + 1}</span>
            <button type="button" className="btn2 danger" onClick={() => patch((x) => { x.story.splice(i, 1); })}>Xóa</button>
          </div>
          <div className="g2">
            <F label="Năm / nhãn"><input value={s.label} onChange={(e) => patch((x) => { x.story[i].label = e.target.value; })} /></F>
            <F label="Tiêu đề"><input value={s.title} onChange={(e) => patch((x) => { x.story[i].title = e.target.value; })} /></F>
          </div>
          <F label="Kể ngắn"><textarea value={s.text} onChange={(e) => patch((x) => { x.story[i].text = e.target.value; })} /></F>
          <div className="row">
            {s.photo && <div className="thumbs" style={{ width: 70 }}><Thumb src={s.photo} onRemove={() => patch((x) => { x.story[i].photo = ""; })} /></div>}
            <Upload slug={d.slug} editKey={editKey} accept="image/jpeg,image/png,image/webp" label="Ảnh cho mốc này" onDone={([u]) => patch((x) => { x.story[i].photo = u; })} />
          </div>
        </div>
      ))}
      <button type="button" className="btn2" onClick={() => patch((x) => { x.story.push({ label: "", title: "", text: "", photo: "" }); })}>+ Thêm mốc</button>
    </>
  );
}

/* ---------- Mừng cưới ---------- */
export function GiftPanel({ d, patch, editKey }: PanelProps) {
  return (
    <>
      <p className="hint">Mỗi tài khoản hiện thành một thẻ có mã QR. Tải ảnh QR từ app ngân hàng (VietQR) để khách quét được ngay.</p>
      {d.gifts.map((g, i) => (
        <div className="item" key={g.id}>
          <div className="item-h">
            <span>{g.label || `Tài khoản ${i + 1}`}</span>
            <button type="button" className="btn2 danger" onClick={() => patch((x) => { x.gifts.splice(i, 1); })}>Xóa</button>
          </div>
          <div className="g2">
            <F label="Nhãn (Nhà trai / Nhà gái)"><input value={g.label} onChange={(e) => patch((x) => { x.gifts[i].label = e.target.value; })} /></F>
            <F label="Ngân hàng"><input value={g.bank} onChange={(e) => patch((x) => { x.gifts[i].bank = e.target.value; })} /></F>
          </div>
          <div className="g2">
            <F label="Số tài khoản"><input value={g.accountNumber} inputMode="numeric" onChange={(e) => patch((x) => { x.gifts[i].accountNumber = e.target.value.replace(/\s/g, ""); })} /></F>
            <F label="Chủ tài khoản"><input value={g.holder} onChange={(e) => patch((x) => { x.gifts[i].holder = e.target.value.toUpperCase(); })} /></F>
          </div>
          <div className="row">
            {g.qrImage && <div className="thumbs" style={{ width: 70 }}><Thumb src={g.qrImage} onRemove={() => patch((x) => { x.gifts[i].qrImage = ""; })} /></div>}
            <Upload slug={d.slug} editKey={editKey} accept="image/jpeg,image/png,image/webp" label="Tải ảnh QR" onDone={([u]) => patch((x) => { x.gifts[i].qrImage = u; })} />
          </div>
        </div>
      ))}
      <button type="button" className="btn2" onClick={() => patch((x) => { x.gifts.push({ id: makeId(), label: "", bank: "", accountNumber: "", holder: "", qrImage: "" }); })}>+ Thêm tài khoản</button>
    </>
  );
}

/* ---------- Hiển thị ---------- */
export function SectionsPanel({ d, patch }: PanelProps) {
  const all = Object.keys(SECTION_LABELS) as SectionId[];
  const hidden = all.filter((s) => !d.sections.includes(s));
  return (
    <>
      <p className="hint">Bỏ tích để ẩn một phần. Dùng mũi tên để đổi thứ tự. Bìa và lời cảm ơn luôn có.</p>
      {d.sections.map((s, i) => (
        <label className="chk" key={s}>
          <input type="checkbox" checked onChange={() => patch((x) => { x.sections.splice(i, 1); })} />
          {SECTION_LABELS[s]}
          <span className="row">
            <button type="button" className="btn2" disabled={i === 0} onClick={() => patch((x) => { [x.sections[i - 1], x.sections[i]] = [x.sections[i], x.sections[i - 1]]; })}>↑</button>
            <button type="button" className="btn2" disabled={i === d.sections.length - 1} onClick={() => patch((x) => { [x.sections[i + 1], x.sections[i]] = [x.sections[i], x.sections[i + 1]]; })}>↓</button>
          </span>
        </label>
      ))}
      {hidden.length > 0 && <p className="ed-h">Đang ẩn</p>}
      {hidden.map((s) => (
        <label className="chk" key={s}>
          <input type="checkbox" checked={false} onChange={() => patch((x) => { x.sections.push(s); })} />
          {SECTION_LABELS[s]}
        </label>
      ))}
    </>
  );
}

/* ---------- Khách ---------- */
export function GuestsPanel({ d, editKey }: PanelProps) {
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null);
  const [wishes, setWishes] = useState<Wish[] | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    api.rsvps(d.slug, editKey).then(setRsvps).catch((e) => setErr((e as Error).message));
    api.wishes(d.slug).then(setWishes).catch(() => setWishes([]));
  }, [d.slug, editKey]);
  const yes = rsvps?.filter((r) => r.attending) ?? [];
  const guests = yes.reduce((n, r) => n + r.guests, 0);
  return (
    <>
      {err && <p className="hint" style={{ color: "var(--ui-danger)" }}>{err}</p>}
      <div className="stat">
        <div><b>{yes.length}</b>xác nhận đến</div>
        <div><b>{guests}</b>tổng số khách</div>
        <div><b>{(rsvps?.length ?? 0) - yes.length}</b>không đến được</div>
        <div><b>{wishes?.length ?? 0}</b>lời chúc</div>
      </div>
      <p className="ed-h">Xác nhận tham dự</p>
      {rsvps && rsvps.length === 0 && <p className="hint">Chưa có ai xác nhận.</p>}
      {rsvps && rsvps.length > 0 && (
        <table className="tbl">
          <thead><tr><th>Tên</th><th>Đến</th><th>SL</th><th>Bên</th><th>Lời nhắn</th></tr></thead>
          <tbody>
            {rsvps.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.attending ? "Có" : "Không"}</td>
                <td>{r.attending ? r.guests : ""}</td>
                <td>{r.side === "groom" ? "Nhà trai" : "Nhà gái"}</td>
                <td>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="ed-h">Lời chúc</p>
      {wishes && wishes.length === 0 && <p className="hint">Chưa có lời chúc nào.</p>}
      {wishes?.map((w) => (
        <div className="item" key={w.id}>
          <div className="item-h"><span>{w.name}</span><span className="hint">{formatWishTime(w.createdAt)}</span></div>
          <p className="hint" style={{ color: "var(--ui-fg)" }}>{w.message}</p>
        </div>
      ))}
    </>
  );
}

/* ---------- Chia sẻ ---------- */
export function SharePanel({ d, editKey }: PanelProps) {
  const [origin] = useState(() => (typeof window === "undefined" ? "" : window.location.origin));
  const [copied, setCopied] = useState("");
  const publicUrl = `${origin}/${d.slug}`;
  const editUrl = `${origin}/edit/${d.slug}?key=${editKey}`;
  async function copy(text: string, which: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* bỏ qua */
    }
  }
  return (
    <>
      <div className="share">
        <b>Link gửi cho khách</b>
        <code>{publicUrl}</code>
        <div className="row">
          <button type="button" className="btn2" onClick={() => copy(publicUrl, "p")}>{copied === "p" ? "Đã sao chép" : "Sao chép"}</button>
          <a className="btn2" href={publicUrl} target="_blank" rel="noopener" style={{ textDecoration: "none" }}>Mở thử</a>
        </div>
        <p className="hint">Nhớ bấm Lưu trước khi gửi. Sửa sau khi gửi thì link vẫn tự cập nhật.</p>
      </div>
      <div className="share">
        <b>Link chỉnh sửa (giữ riêng)</b>
        <code>{editUrl}</code>
        <div className="row">
          <button type="button" className="btn2" onClick={() => copy(editUrl, "e")}>{copied === "e" ? "Đã sao chép" : "Sao chép"}</button>
        </div>
        <p className="hint">Ai có link này đều sửa được thiệp. Chỉ gửi cho cô dâu chú rể.</p>
      </div>
    </>
  );
}
