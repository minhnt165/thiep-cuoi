"use client";

import { useState } from "react";
import { makeId } from "@/lib/schema";
import { EXPENSE_CATEGORIES, PAYERS, expenseCost, expenseRemaining, summarize, sum, type CategoryId, type Expense } from "@/lib/plan";
import { Bar, Empty, MoneyInput, Stat, Vnd, downloadCsv, type PageProps } from "./ui";
import { Icon } from "./icons";

export function Budget({ plan, setPlan, guests, rsvps, today, inv }: PageProps) {
  const [focusId, setFocusId] = useState("");
  const s = summarize(plan, guests, rsvps, today).money;
  const over = s.budget > 0 && s.cost > s.budget;
  const byPayer = (k: Expense["payer"]) => sum(plan.expenses.filter((e) => e.payer === k), expenseCost);

  function add(category: CategoryId) {
    const id = makeId();
    setPlan((p) => { p.expenses.push({ id, category, title: "", vendor: "", estimate: 0, actual: 0, paid: 0, payer: "both", note: "" }); });
    setFocusId(id);
  }

  function exportCsv() {
    const label = Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, c.label]));
    downloadCsv(`chi-phi-${inv.slug}.csv`, [
      ["Hạng mục", "Khoản chi", "Nơi cung cấp", "Dự kiến", "Chốt giá", "Đã trả", "Còn phải trả", "Bên chi", "Ghi chú"],
      ...plan.expenses.map((e) => [label[e.category], e.title, e.vendor, e.estimate, e.actual, e.paid, expenseRemaining(e), PAYERS[e.payer], e.note]),
    ]);
  }

  const used = EXPENSE_CATEGORIES.filter((c) => plan.expenses.some((e) => e.category === c.id));

  return (
    <>
      <section className="pl-panel">
        <div className="pl-budget">
          <label className="f">
            Ngân sách tổng
            <MoneyInput value={plan.budget} onChange={(n) => setPlan((p) => { p.budget = n; })} placeholder="VD: 300tr" />
          </label>
          <div className="pl-stats">
            <Stat label="Dự kiến / chốt"><Vnd n={s.cost} /></Stat>
            <Stat label="Đã trả, đã cọc" tone="ok"><Vnd n={s.paid} /></Stat>
            <Stat label="Còn phải trả"><Vnd n={s.remaining} /></Stat>
            {s.budget > 0 && <Stat label={over ? "Vượt ngân sách" : "Còn dư"} tone={over ? "warn" : undefined}><Vnd n={Math.abs(s.budget - s.cost)} /></Stat>}
          </div>
        </div>
        {s.budget > 0 && <Bar value={s.cost} max={s.budget} label="Chi phí so với ngân sách" />}
        {plan.expenses.length > 0 && (
          <p className="hint">Nhà trai chi <Vnd n={byPayer("groom")} /> · Nhà gái chi <Vnd n={byPayer("bride")} /> · Chung <Vnd n={byPayer("both")} /></p>
        )}
        <p className="hint">Gõ tắt được: 500k, 15tr, 1,2 tỷ. Cột &quot;Chốt giá&quot; để trống thì tính theo dự kiến.</p>
      </section>

      {used.map((c) => {
        const items = plan.expenses.filter((e) => e.category === c.id);
        const cost = sum(items, expenseCost);
        return (
          <section key={c.id} className="pl-panel">
            <div className="pl-panel-h">
              <h3>{c.label}</h3>
              <span className="hint"><Vnd n={cost} /> · còn trả <Vnd n={sum(items, expenseRemaining)} /></span>
            </div>
            <div className="pl-scroll">
              <table className="pl-tbl cardify">
                <thead>
                  <tr><th>Khoản chi</th><th>Nơi cung cấp</th><th className="num">Dự kiến</th><th className="num">Chốt giá</th><th className="num">Đã trả</th><th>Bên chi</th><th className="num">Còn trả</th><th /></tr>
                </thead>
                <tbody>
                  {items.map((e) => {
                    const i = plan.expenses.findIndex((x) => x.id === e.id);
                    const set = (fn: (x: Expense) => void) => setPlan((p) => fn(p.expenses[i]));
                    return (
                      <tr key={e.id}>
                        <td className="c-main" data-label="Khoản chi"><input className="pl-in name" value={e.title} placeholder="Tên khoản" autoFocus={e.id === focusId} aria-label="Khoản chi" onChange={(ev) => set((x) => { x.title = ev.target.value; })} /></td>
                        <td className="c-wide" data-label="Nơi cung cấp"><input className="pl-in" value={e.vendor} placeholder="—" aria-label="Nơi cung cấp" onChange={(ev) => set((x) => { x.vendor = ev.target.value; })} /></td>
                        <td data-label="Dự kiến"><MoneyInput className="pl-in num" value={e.estimate} aria-label="Dự kiến" onChange={(n) => set((x) => { x.estimate = n; })} /></td>
                        <td data-label="Chốt giá"><MoneyInput className="pl-in num" value={e.actual} aria-label="Chốt giá" onChange={(n) => set((x) => { x.actual = n; })} /></td>
                        <td data-label="Đã trả"><MoneyInput className="pl-in num" value={e.paid} aria-label="Đã trả" onChange={(n) => set((x) => { x.paid = n; })} /></td>
                        <td data-label="Bên chi">
                          <select className="pl-in" value={e.payer} aria-label="Bên chi" onChange={(ev) => set((x) => { x.payer = ev.target.value as Expense["payer"]; })}>
                            {Object.entries(PAYERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </td>
                        <td className="num c-wide" data-label="Còn phải trả">{expenseRemaining(e) > 0 ? <Vnd n={expenseRemaining(e)} /> : <span className="pl-ok">Đã trả đủ</span>}</td>
                        <td className="c-act"><button type="button" className="pl-x" aria-label={`Xóa ${e.title}`} onClick={() => setPlan((p) => { p.expenses.splice(i, 1); })}><Icon name="trash" size={16} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button type="button" className="pl-add" onClick={() => add(c.id)}><Icon name="plus" size={16} />Thêm khoản {c.label.toLowerCase()}</button>
          </section>
        );
      })}

      <section className="pl-panel">
        <h3>Thêm khoản chi</h3>
        {plan.expenses.length === 0 && <Empty title="Chưa có khoản chi nào">Chọn hạng mục bên dưới để bắt đầu. Mỗi khoản ghi dự kiến, giá chốt và số đã cọc.</Empty>}
        <div className="pl-chips">
          {EXPENSE_CATEGORIES.map((c) => (
            <button key={c.id} type="button" className="pl-chip" onClick={() => add(c.id)}><Icon name="plus" size={14} />{c.label}</button>
          ))}
        </div>
        {plan.expenses.length > 0 && (
          <div className="row"><button type="button" className="btn2 pl-btn-ic" onClick={exportCsv}><Icon name="download" size={16} />Xuất file Excel (CSV)</button></div>
        )}
      </section>
    </>
  );
}
