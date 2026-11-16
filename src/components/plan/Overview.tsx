"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { EXPENSE_CATEGORIES, expenseCost, expenseRemaining, isOverdue, PHASES, sum, summarize, GIFT_METHODS } from "@/lib/plan";
import { countdown, dotDate, longDate, toVnDate, weekdayLabel } from "@/lib/dates";
import { formatMoney, formatMoneyShort } from "@/lib/money";
import { Avatar, Bar, Empty, Ring, SplitBar, Vnd, type PageProps } from "./ui";
import { Icon } from "./icons";

const PHASE_LABEL = Object.fromEntries(PHASES.map((p) => [p.id, p.label]));
const PHASE_ORDER = Object.fromEntries(PHASES.map((p, i) => [p.id, i]));

/** Đếm ngược tới giờ tiệc, cập nhật mỗi phút */
function useCountdown(ymd: string, hm: string) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return countdown(toVnDate(ymd, hm), now);
}

export function Overview({ inv, plan, setPlan, guests, rsvps, today, go }: PageProps) {
  const s = summarize(plan, guests, rsvps, today);
  const cd = useCountdown(inv.mainEvent.date, inv.mainEvent.time);
  const cover = inv.photos.cover || inv.photos.saveTheDate[0] || inv.photos.album[0] || "";

  const upcoming = plan.tasks
    .filter((t) => !t.done && t.title)
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999") || PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase])
    .slice(0, 5);

  // Chi phí theo hạng mục, xếp lớn → nhỏ (một màu, độ đậm = đã trả / còn trả)
  const cats = EXPENSE_CATEGORIES.map((c) => {
    const items = plan.expenses.filter((e) => e.category === c.id);
    return { ...c, cost: sum(items, expenseCost), remaining: sum(items, expenseRemaining) };
  })
    .filter((c) => c.cost > 0)
    .sort((a, b) => b.cost - a.cost);
  const maxCat = cats[0]?.cost ?? 0;

  const guestSide = (k: "groom" | "bride") => sum(guests.filter((g) => g.side === k), (g) => g.count);
  const recentGifts = plan.gifts.slice(0, 5);

  return (
    <>
      <section className={`pl-hero ${cover ? "has-photo" : ""}`}>
        {cover && <img src={cover} alt="" className="pl-hero-img" />}
        <div className="pl-hero-text">
          <p className="pl-eyebrow"><Icon name="calendar" size={14} />{weekdayLabel(inv.mainEvent.date)}, {longDate(inv.mainEvent.date)} · {inv.mainEvent.time}</p>
          <h2>{inv.groom.shortName} <em>&amp;</em> {inv.bride.shortName}</h2>
          <p className="pl-hero-venue"><Icon name="pin" size={14} />{inv.mainEvent.venue || "Chưa nhập nơi tổ chức"}</p>
        </div>
        <div className="pl-cd" aria-label={cd.passed ? "Đã qua ngày cưới" : `Còn ${cd.days} ngày ${cd.hours} giờ`}>
          {cd.passed ? (
            <div className="pl-cd-done"><Icon name="heart" size={22} /><span>Chúc mừng hạnh phúc</span></div>
          ) : (
            <>
              <div><b>{cd.days}</b><span>ngày</span></div>
              <div><b>{String(cd.hours).padStart(2, "0")}</b><span>giờ</span></div>
              <div><b>{String(cd.minutes).padStart(2, "0")}</b><span>phút</span></div>
            </>
          )}
        </div>
      </section>

      <div className="pl-cards">
        <button type="button" className="pl-card" onClick={() => go("tasks")}>
          <span className="pl-card-h"><i className="pl-ic"><Icon name="tasks" /></i>Công việc</span>
          <div className="pl-card-ring">
            <Ring value={s.tasks.done} max={s.tasks.total} label="Việc đã xong" />
            <div>
              <b>{s.tasks.done}<small>/{s.tasks.total}</small></b>
              <span className="hint">việc đã xong</span>
            </div>
          </div>
          {s.tasks.overdue ? <span className="pl-flag warn"><Icon name="alert" size={14} />{s.tasks.overdue} việc quá hạn</span> : <span className="pl-flag ok"><Icon name="check" size={14} />Đúng tiến độ</span>}
        </button>

        <button type="button" className="pl-card" onClick={() => go("budget")}>
          <span className="pl-card-h"><i className="pl-ic"><Icon name="wallet" /></i>Chi phí</span>
          <b>{formatMoneyShort(s.money.cost)}<small>{s.money.budget ? ` / ${formatMoneyShort(s.money.budget)}` : " dự kiến"}</small></b>
          <Bar value={s.money.cost} max={s.money.budget || s.money.cost} label="Chi phí so với ngân sách" />
          {s.money.budget > 0 && s.money.cost > s.money.budget ? (
            <span className="pl-flag warn"><Icon name="alert" size={14} />Vượt {formatMoneyShort(s.money.cost - s.money.budget)}</span>
          ) : (
            <span className="hint">Đã trả {formatMoneyShort(s.money.paid)} · còn {formatMoneyShort(s.money.remaining)}</span>
          )}
        </button>

        <button type="button" className="pl-card" onClick={() => go("guests")}>
          <span className="pl-card-h"><i className="pl-ic"><Icon name="users" /></i>Khách mời</span>
          <b>{s.guests.people}<small> người</small></b>
          <SplitBar groom={guestSide("groom")} bride={guestSide("bride")} format={(n) => `${n}`} />
          <span className="hint">Đã gửi {s.guests.sent}/{s.guests.names} · {s.guests.confirmedPeople} người xác nhận đến</span>
        </button>

        <button type="button" className="pl-card" onClick={() => go("gifts")}>
          <span className="pl-card-h"><i className="pl-ic"><Icon name="envelope" /></i>Tiền mừng</span>
          <b>{formatMoneyShort(s.gifts.total)}<small> · {s.gifts.count} phong bì</small></b>
          <SplitBar groom={s.gifts.groom} bride={s.gifts.bride} format={formatMoneyShort} />
        </button>
      </div>

      <div className="pl-2col">
        <section className="pl-panel">
          <div className="pl-panel-h">
            <h3>Việc cần làm tiếp</h3>
            <button type="button" className="pl-link" onClick={() => go("tasks")}>Tất cả<Icon name="chevron" size={14} /></button>
          </div>
          {upcoming.length === 0 && <Empty title="Xong hết rồi">Không còn việc nào chưa làm.</Empty>}
          <ul className="pl-list">
            {upcoming.map((t) => {
              const late = isOverdue(t, today);
              return (
                <li key={t.id}>
                  <label className="pl-check">
                    <input type="checkbox" className="pl-cb" checked={t.done} onChange={() => setPlan((p) => { const x = p.tasks.find((y) => y.id === t.id); if (x) x.done = !x.done; })} />
                    <span>
                      {t.title}
                      {t.owner && <small className="hint"> · {t.owner}</small>}
                    </span>
                  </label>
                  <span className={`pl-date ${late ? "late" : ""}`}>{late && <Icon name="alert" size={13} />}{t.due ? dotDate(t.due) : PHASE_LABEL[t.phase]}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="pl-panel">
          <div className="pl-panel-h">
            <h3>Chi phí theo hạng mục</h3>
            <button type="button" className="pl-link" onClick={() => go("budget")}>Chi tiết<Icon name="chevron" size={14} /></button>
          </div>
          {cats.length === 0 ? (
            <Empty title="Chưa có khoản chi">Nhập các khoản tiệc, ảnh, trang phục… để theo dõi so với ngân sách.</Empty>
          ) : (
            <>
              <ul className="pl-cats" aria-label="Chi phí theo hạng mục">
                {cats.map((c) => (
                  <li key={c.id} tabIndex={0}>
                    <span className="pl-cat-name">{c.label}</span>
                    <span className="pl-cat-track">
                      <span className="pl-cat-bar" style={{ width: `${(c.cost / maxCat) * 100}%` }}>
                        <span className="paid" style={{ flexGrow: c.cost - c.remaining }} />
                        <span className="due" style={{ flexGrow: c.remaining }} />
                      </span>
                      <span className="pl-tip" role="tooltip">{c.label}: <b>{formatMoney(c.cost)} đ</b> · đã trả {formatMoney(c.cost - c.remaining)} đ</span>
                    </span>
                    <span className="pl-num">{formatMoneyShort(c.cost)}</span>
                  </li>
                ))}
              </ul>
              <div className="pl-legend">
                <span><i className="paid" />Đã trả</span>
                <span><i className="due" />Còn phải trả</span>
              </div>
            </>
          )}
        </section>
      </div>

      <section className="pl-panel">
        <div className="pl-panel-h">
          <h3>Phong bì mới ghi</h3>
          <button type="button" className="pl-link" onClick={() => go("gifts")}>Sổ tiền mừng<Icon name="chevron" size={14} /></button>
        </div>
        {recentGifts.length === 0 ? (
          <Empty title="Chưa ghi phong bì nào">Ngày cưới mở sổ tiền mừng ra ghi nhanh, gõ tên rồi số tiền là xong.</Empty>
        ) : (
          <ul className="pl-list">
            {recentGifts.map((g) => (
              <li key={g.id}>
                <span className="pl-who"><Avatar name={g.name} side={g.side} /><span>{g.name}<small className="hint"> · {GIFT_METHODS[g.method]}</small></span></span>
                <Vnd n={g.amount} className="pl-num" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
