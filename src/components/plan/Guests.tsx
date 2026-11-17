"use client";

import { useMemo, useState } from "react";
import { makeId, type Guest, type Rsvp } from "@/lib/schema";
import { giftsFor, rsvpFor, sameName, summarize } from "@/lib/plan";
import { Avatar, Empty, SIDES, SplitBar, Stat, Vnd, downloadCsv, useCopy, type PageProps } from "./ui";
import { Icon } from "./icons";
import { confirmDelete, quote } from "@/components/ConfirmDialog";

type Status = "all" | "unsent" | "yes" | "no" | "waiting";

/** "Gia đình chú Ba, 4" → tên + số người */
function parseLine(line: string): { name: string; count: number } {
  const m = /^(.*?)[,;|]\s*(\d{1,2})\s*(người)?$/i.exec(line);
  if (m && m[1].trim()) return { name: m[1].trim(), count: Math.max(1, Number(m[2])) };
  return { name: line, count: 1 };
}

function rsvpLabel(r: Rsvp | undefined): { text: string; cls: string } {
  if (!r) return { text: "Chưa xác nhận", cls: "wait" };
  return r.attending ? { text: `Đến · ${r.guests} người`, cls: "yes" } : { text: "Không đến", cls: "no" };
}

export function Guests({ inv, plan, guests, setGuests, rsvps, today }: PageProps) {
  const [bulk, setBulk] = useState("");
  const [bulkSide, setBulkSide] = useState<Guest["side"]>("groom");
  const [bulkGroup, setBulkGroup] = useState("");
  const [q, setQ] = useState("");
  const [side, setSide] = useState<"" | Guest["side"]>("");
  const [group, setGroup] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const { copied, copy } = useCopy();

  const s = summarize(plan, guests, rsvps, today).guests;
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const link = (name: string) => `${origin}/${inv.slug}?to=${encodeURIComponent(name)}`;
  const groups = useMemo(() => [...new Set(guests.map((g) => g.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi")), [guests]);
  const bySide = (k: Guest["side"]) => guests.filter((g) => g.side === k).reduce((n, g) => n + g.count, 0);

  // Khách tự xác nhận nhưng không có trong danh sách
  const strangers = rsvps.filter((r) => !guests.some((g) => sameName(g.name, r.invitedAs) || sameName(g.name, r.name)));

  const lines = bulk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  function addBulk() {
    if (!lines.length) return;
    setGuests((list) => {
      list.push(...lines.map((l) => ({ id: makeId(), ...parseLine(l), side: bulkSide, group: bulkGroup.trim(), note: "", phone: "", sent: false })));
    });
    setBulk("");
  }

  function addStrangers() {
    setGuests((list) => {
      list.push(...strangers.map((r) => ({ id: makeId(), name: r.invitedAs || r.name, count: r.attending ? r.guests : 1, side: r.side, group: "", note: r.note.slice(0, 200), phone: "", sent: true })));
    });
  }

  const shown = guests.filter((g) => {
    if (q && !g.name.toLocaleLowerCase("vi").includes(q.trim().toLocaleLowerCase("vi")) && !g.phone.includes(q.trim())) return false;
    if (side && g.side !== side) return false;
    if (group && g.group !== group) return false;
    const r = rsvpFor(g, rsvps);
    if (status === "unsent") return !g.sent;
    if (status === "yes") return !!r?.attending;
    if (status === "no") return !!r && !r.attending;
    if (status === "waiting") return !r;
    return true;
  });

  async function remove(g: Guest) {
    if (g.name.trim()) {
      const gift = giftsFor(g, plan.gifts);
      const detail = (
        <>
          Link riêng đã gửi cho khách vẫn mở được thiệp.{gift ? " Phong bì đã ghi cho khách này vẫn giữ trong sổ tiền mừng." : ""} Xóa xong là lưu luôn.
        </>
      );
      if (!(await confirmDelete(`Xóa khách ${quote(g.name)}`, detail))) return;
    }
    setGuests((list) => {
      const k = list.findIndex((x) => x.id === g.id);
      if (k >= 0) list.splice(k, 1);
    });
  }

  function exportCsv() {
    downloadCsv(`khach-moi-${inv.slug}.csv`, [
      ["Tên", "Bên", "Nhóm", "Số người", "Điện thoại", "Đã gửi thiệp", "Xác nhận", "Tiền mừng", "Link riêng"],
      ...guests.map((g) => [g.name, SIDES[g.side], g.group, g.count, g.phone, g.sent ? "Có" : "", rsvpLabel(rsvpFor(g, rsvps)).text, giftsFor(g, plan.gifts) || "", link(g.name)]),
    ]);
  }

  return (
    <>
      <div className="pl-stats">
        <Stat label="Khách mời">{s.people} người <small>({s.names} tên)</small></Stat>
        <Stat label="Đã gửi thiệp">{s.sent}/{s.names}</Stat>
        <Stat label="Xác nhận đến" tone="ok">{s.confirmedPeople} người</Stat>
        <Stat label="Không đến">{s.declined}</Stat>
      </div>
      {guests.length > 0 && (
        <section className="pl-panel pl-sidepanel">
          <h3>Hai bên</h3>
          <SplitBar groom={bySide("groom")} bride={bySide("bride")} format={(n) => `${n} người`} />
        </section>
      )}

      <section className="pl-panel">
        <h3>Thêm khách</h3>
        <label className="f">
          Mỗi dòng một tên. Thêm số người sau dấu phẩy nếu đi cả nhà.
          <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"Cô Lan\nGia đình anh Hùng, 4\nBạn Minh Anh"} rows={4} />
        </label>
        <div className="row">
          <select className="pl-in boxed" value={bulkSide} aria-label="Bên" onChange={(e) => setBulkSide(e.target.value as Guest["side"])}>
            <option value="groom">Nhà trai</option>
            <option value="bride">Nhà gái</option>
          </select>
          <input className="pl-in boxed" value={bulkGroup} onChange={(e) => setBulkGroup(e.target.value)} placeholder="Nhóm (Họ hàng, Bạn đại học…)" list="pl-groups" aria-label="Nhóm" />
          <button type="button" className="pl-primary" onClick={addBulk} disabled={!lines.length}><Icon name="plus" size={16} />Thêm {lines.length || ""} khách</button>
        </div>
      </section>

      {strangers.length > 0 && (
        <section className="pl-note"><Icon name="alert" size={18} />
          <span><b>{strangers.length} người</b> đã xác nhận qua thiệp nhưng chưa có trong danh sách: {strangers.slice(0, 4).map((r) => r.invitedAs || r.name).join(", ")}{strangers.length > 4 ? "…" : ""}</span>
          <button type="button" className="btn2" onClick={addStrangers}>Thêm vào danh sách</button>
        </section>
      )}

      <datalist id="pl-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>

      <section className="pl-panel">
        <div className="pl-filters">
          <span className="pl-search"><Icon name="search" size={16} /><input className="pl-in boxed grow" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên, số điện thoại" aria-label="Tìm khách" /></span>
          <select className="pl-in boxed" value={side} aria-label="Lọc theo bên" onChange={(e) => setSide(e.target.value as "" | Guest["side"])}>
            <option value="">Cả hai bên</option>
            <option value="groom">Nhà trai</option>
            <option value="bride">Nhà gái</option>
          </select>
          {groups.length > 0 && (
            <select className="pl-in boxed" value={group} aria-label="Lọc theo nhóm" onChange={(e) => setGroup(e.target.value)}>
              <option value="">Mọi nhóm</option>
              {groups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          )}
          <select className="pl-in boxed" value={status} aria-label="Lọc theo trạng thái" onChange={(e) => setStatus(e.target.value as Status)}>
            <option value="all">Mọi trạng thái</option>
            <option value="unsent">Chưa gửi thiệp</option>
            <option value="waiting">Chưa xác nhận</option>
            <option value="yes">Xác nhận đến</option>
            <option value="no">Không đến</option>
          </select>
        </div>

        {guests.length === 0 ? (
          <Empty title="Chưa có khách nào">Thêm ở trên. Mỗi khách có link riêng: mở thiệp thấy &quot;Thân mời + tên&quot; và điền sẵn tên khi xác nhận.</Empty>
        ) : (
          <div className="pl-scroll">
            <table className="pl-tbl cardify">
              <thead>
                <tr><th title="Đã gửi thiệp">Gửi</th><th>Tên</th><th>Bên</th><th>Nhóm</th><th className="num">Số người</th><th>Điện thoại</th><th>Xác nhận</th><th className="num">Tiền mừng</th><th /></tr>
              </thead>
              <tbody>
                {shown.map((g) => {
                  const i = guests.findIndex((x) => x.id === g.id);
                  const set = (fn: (x: Guest) => void) => setGuests((list) => fn(list[i]));
                  const r = rsvpLabel(rsvpFor(g, rsvps));
                  const gift = giftsFor(g, plan.gifts);
                  return (
                    <tr key={g.id}>
                      <td className="c-sent" data-label="Đã gửi thiệp"><input type="checkbox" className="pl-cb" checked={g.sent} aria-label={`Đã gửi thiệp cho ${g.name}`} onChange={(e) => set((x) => { x.sent = e.target.checked; })} /></td>
                      <td className="c-main"><span className="pl-who"><Avatar name={g.name} side={g.side} /><input className="pl-in name" value={g.name} aria-label="Tên" onChange={(e) => set((x) => { x.name = e.target.value; })} /></span></td>
                      <td data-label="Bên">
                        <select className="pl-in" value={g.side} aria-label="Bên" onChange={(e) => set((x) => { x.side = e.target.value as Guest["side"]; })}>
                          <option value="groom">Nhà trai</option>
                          <option value="bride">Nhà gái</option>
                        </select>
                      </td>
                      <td data-label="Nhóm"><input className="pl-in" value={g.group} placeholder="—" list="pl-groups" aria-label="Nhóm" onChange={(e) => set((x) => { x.group = e.target.value; })} /></td>
                      <td data-label="Số người"><input className="pl-in num short" type="number" min={1} max={50} value={g.count} aria-label="Số người" onChange={(e) => set((x) => { x.count = Math.min(50, Math.max(1, Number(e.target.value) || 1)); })} /></td>
                      <td data-label="Điện thoại"><input className="pl-in" type="tel" value={g.phone} placeholder="—" aria-label="Điện thoại" onChange={(e) => set((x) => { x.phone = e.target.value; })} /></td>
                      <td data-label="Xác nhận"><span className={`pl-badge ${r.cls}`}>{r.text}</span></td>
                      <td className="num" data-label="Tiền mừng">{gift ? <Vnd n={gift} /> : <span className="hint">—</span>}</td>
                      <td className="c-act">
                        <div className="pl-acts">
                          <button type="button" className="btn2 pl-btn-ic" onClick={() => copy(link(g.name), g.id)}><Icon name={copied === g.id ? "check" : "link"} size={14} />{copied === g.id ? "Đã chép" : "Chép link"}</button>
                          <button type="button" className="pl-x" aria-label={`Xóa ${g.name}`} onClick={() => remove(g)}><Icon name="trash" size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {guests.length > 0 && shown.length === 0 && <p className="hint">Không có khách nào khớp bộ lọc.</p>}
        {guests.length > 0 && (
          <div className="row">
            <button type="button" className="btn2 pl-btn-ic" onClick={() => copy(shown.map((g) => `${g.name}: ${link(g.name)}`).join("\n"), "all")}>
              <Icon name="link" size={16} />{copied === "all" ? "Đã sao chép" : `Sao chép link ${shown.length} khách đang lọc`}
            </button>
            <button type="button" className="btn2 pl-btn-ic" onClick={exportCsv}><Icon name="download" size={16} />Xuất file Excel (CSV)</button>
          </div>
        )}
      </section>
    </>
  );
}
