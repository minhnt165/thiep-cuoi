"use client";

import { useRef, useState, type FormEvent } from "react";
import { makeId } from "@/lib/schema";
import { GIFT_METHODS, sameName, sum, summarize, type Gift } from "@/lib/plan";
import { formatWishTime } from "@/lib/dates";
import { Avatar, Empty, MoneyInput, SIDES, SplitBar, Stat, downloadCsv, type PageProps } from "./ui";
import { formatMoneyShort } from "@/lib/money";
import { Icon } from "./icons";
import { confirmDelete, quote } from "@/components/ConfirmDialog";

const EMPTY = { name: "", side: "groom" as Gift["side"], amount: 0, method: "cash" as Gift["method"], note: "" };

export function Gifts({ inv, plan, setPlan, guests, rsvps, today }: PageProps) {
  const [form, setForm] = useState(EMPTY);
  const [q, setQ] = useState("");
  const [side, setSide] = useState<"" | Gift["side"]>("");
  const nameRef = useRef<HTMLInputElement>(null);
  const s = summarize(plan, guests, rsvps, today).gifts;

  const matched = guests.find((g) => sameName(g.name, form.name));

  function changeName(name: string) {
    const g = guests.find((x) => sameName(x.name, name));
    setForm((f) => ({ ...f, name, side: g ? g.side : f.side }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || form.amount <= 0) return;
    const gift: Gift = { id: makeId(), guestId: matched?.id ?? "", ...form, name: matched?.name ?? form.name.trim(), note: form.note.trim(), createdAt: new Date().toISOString() };
    setPlan((p) => { p.gifts.unshift(gift); });
    // Giữ bên và hình thức cho phong bì tiếp theo (thường ghi liền một loạt cùng bên)
    setForm((f) => ({ ...EMPTY, side: f.side, method: f.method }));
    nameRef.current?.focus();
  }

  const needle = q.trim().toLocaleLowerCase("vi");
  const shown = plan.gifts.filter((g) => (!needle || g.name.toLocaleLowerCase("vi").includes(needle) || g.note.toLocaleLowerCase("vi").includes(needle)) && (!side || g.side === side));
  const methods = (Object.keys(GIFT_METHODS) as Gift["method"][]).map((m) => [m, sum(plan.gifts.filter((g) => g.method === m), (g) => g.amount)] as const).filter(([, n]) => n > 0);

  async function remove(g: Gift) {
    const blank = !g.name.trim() && !g.amount;
    const detail = `${g.amount.toLocaleString("vi-VN")} đ · ${SIDES[g.side]} · ${GIFT_METHODS[g.method]}. Xóa xong là lưu luôn, không hoàn tác được.`;
    if (!blank && !(await confirmDelete(`Xóa phong bì của ${g.name.trim() ? quote(g.name) : "khách chưa ghi tên"}`, detail))) return;
    setPlan((p) => { p.gifts = p.gifts.filter((x) => x.id !== g.id); });
  }

  function exportCsv() {
    downloadCsv(`tien-mung-${inv.slug}.csv`, [
      ["Tên", "Bên", "Số tiền", "Hình thức", "Ghi chú", "Thời gian ghi"],
      ...plan.gifts.map((g) => [g.name, SIDES[g.side], g.amount, GIFT_METHODS[g.method], g.note, formatWishTime(g.createdAt)]),
    ]);
  }

  return (
    <>
      <section className="pl-panel pl-gifthead">
        <div className="pl-gifttotal">
          <span className="pl-ic big"><Icon name="envelope" size={22} /></span>
          <div>
            <small>Tổng tiền mừng · {s.count} phong bì</small>
            <b>{s.total.toLocaleString("vi-VN")} đ</b>
          </div>
        </div>
        <SplitBar groom={s.groom} bride={s.bride} format={formatMoneyShort} />
        {methods.length > 0 && (
          <div className="pl-stats">
            {methods.map(([m, n]) => <Stat key={m} label={GIFT_METHODS[m]}>{formatMoneyShort(n)}</Stat>)}
          </div>
        )}
      </section>

      <form className="pl-panel pl-giftform" onSubmit={submit}>
        <h3>Ghi tiền mừng</h3>
        <datalist id="pl-guest-names">{guests.map((g) => <option key={g.id} value={g.name} />)}</datalist>
        <div className="pl-giftrow">
          <label className="f grow">
            Tên khách
            <input ref={nameRef} value={form.name} onChange={(e) => changeName(e.target.value)} list="pl-guest-names" placeholder="Gõ tên, chọn từ danh sách khách" autoComplete="off" />
          </label>
          <label className="f">
            Số tiền
            <MoneyInput value={form.amount} onChange={(n) => setForm((f) => ({ ...f, amount: n }))} placeholder="500k" />
          </label>
          <label className="f">
            Bên
            <select value={form.side} onChange={(e) => setForm((f) => ({ ...f, side: e.target.value as Gift["side"] }))}>
              <option value="groom">Nhà trai</option>
              <option value="bride">Nhà gái</option>
            </select>
          </label>
          <label className="f">
            Hình thức
            <select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value as Gift["method"] }))}>
              {Object.entries(GIFT_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="f grow">
            Ghi chú
            <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="VD: 1 chỉ vàng, gửi qua mẹ" />
          </label>
          <button type="submit" className="pl-primary" disabled={!form.name.trim() || form.amount <= 0}><Icon name="plus" size={16} />Ghi</button>
        </div>
        <p className="hint">
          {form.name.trim() ? (matched ? `Khớp khách trong danh sách (${SIDES[matched.side]}${matched.group ? `, ${matched.group}` : ""}).` : "Khách ngoài danh sách, vẫn ghi được.") : "Gõ tắt số tiền: 500k, 1tr, 2,5tr. Bấm Enter để ghi nhanh."}
        </p>
      </form>

      <section className="pl-panel">
        <div className="pl-filters">
          <span className="pl-search"><Icon name="search" size={16} /><input className="pl-in boxed grow" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên, ghi chú" aria-label="Tìm" /></span>
          <select className="pl-in boxed" value={side} aria-label="Lọc theo bên" onChange={(e) => setSide(e.target.value as "" | Gift["side"])}>
            <option value="">Cả hai bên</option>
            <option value="groom">Nhà trai</option>
            <option value="bride">Nhà gái</option>
          </select>
        </div>
        {plan.gifts.length === 0 ? (
          <Empty title="Chưa ghi phong bì nào">Sổ này giúp tra lại khi đi đám cưới nhà người ta.</Empty>
        ) : (
          <div className="pl-scroll">
            <table className="pl-tbl cardify">
              <thead><tr><th>Tên</th><th>Bên</th><th className="num">Số tiền</th><th>Hình thức</th><th>Ghi chú</th><th /></tr></thead>
              <tbody>
                {shown.map((g) => {
                  const i = plan.gifts.findIndex((x) => x.id === g.id);
                  const set = (fn: (x: Gift) => void) => setPlan((p) => fn(p.gifts[i]));
                  return (
                    <tr key={g.id}>
                      <td className="c-main"><span className="pl-who"><Avatar name={g.name} side={g.side} /><input className="pl-in name" value={g.name} aria-label="Tên" onChange={(e) => set((x) => { x.name = e.target.value; })} /></span></td>
                      <td data-label="Bên">
                        <select className="pl-in" value={g.side} aria-label="Bên" onChange={(e) => set((x) => { x.side = e.target.value as Gift["side"]; })}>
                          <option value="groom">Nhà trai</option>
                          <option value="bride">Nhà gái</option>
                        </select>
                      </td>
                      <td data-label="Số tiền"><MoneyInput className="pl-in num strong" value={g.amount} aria-label="Số tiền" onChange={(n) => set((x) => { x.amount = n; })} /></td>
                      <td data-label="Hình thức">
                        <select className="pl-in" value={g.method} aria-label="Hình thức" onChange={(e) => set((x) => { x.method = e.target.value as Gift["method"]; })}>
                          {Object.entries(GIFT_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                      <td data-label="Ghi chú"><input className="pl-in" value={g.note} placeholder="—" aria-label="Ghi chú" onChange={(e) => set((x) => { x.note = e.target.value; })} /></td>
                      <td className="c-act"><button type="button" className="pl-x" aria-label={`Xóa ${g.name}`} onClick={() => remove(g)}><Icon name="trash" size={16} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {plan.gifts.length > 0 && shown.length === 0 && <p className="hint">Không có phong bì nào khớp.</p>}
        {plan.gifts.length > 0 && <div className="row"><button type="button" className="btn2 pl-btn-ic" onClick={exportCsv}><Icon name="download" size={16} />Xuất file Excel (CSV)</button></div>}
      </section>
    </>
  );
}
