"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { solarToLunar, yearName } from "@/lib/lunar";
import "./date-picker.css";

/**
 * Chọn ngày kiểu Việt Nam: hiện dd/mm/yyyy, tuần bắt đầu thứ Hai, mỗi ô có
 * ngày âm nhỏ bên dưới, đánh dấu được ngày đặc biệt (ngày cưới).
 * Thay cho <input type="date"> vốn hiện theo ngôn ngữ trình duyệt (thường là mm/dd/yyyy).
 * Trên điện thoại lịch mở thành tấm trượt từ dưới lên.
 * Lịch gắn thẳng vào body (portal) để không bị khối cha có overflow/container
 * cắt mất hay giữ position: fixed lại bên trong.
 */

const WEEK = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
};
/** Cộng ngày, trả YYYY-MM-DD (UTC để không lệch múi giờ) */
const shift = (s: string, days: number) => {
  const { y, m, d } = parse(s);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};
const weekday = (s: string) => {
  const { y, m, d } = parse(s);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};
const todayVn = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);

/** "T6, 20/11/2026" */
export function formatViDate(s: string, withWeekday = true): string {
  const { y, m, d } = parse(s);
  return `${withWeekday ? `${WEEKDAY_SHORT[weekday(s)]}, ` : ""}${pad(d)}/${pad(m)}/${y}`;
}

function monthCells(year: number, month: number): string[] {
  const first = ymd(year, month, 1);
  const offset = (weekday(first) + 6) % 7; // T2 = 0
  const start = shift(first, -offset);
  return Array.from({ length: 42 }, (_, i) => shift(start, i));
}

export interface DateMark {
  date: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Cho phép xóa ngày (hạn công việc có thể để trống) */
  clearable?: boolean;
  placeholder?: string;
  marks?: DateMark[];
  className?: string;
  "aria-label"?: string;
  /** Tô đỏ (quá hạn) */
  invalid?: boolean;
  /** Hiện thứ trong ô (T6, 20/11/2026) */
  withWeekday?: boolean;
}

export function DatePicker({ value, onChange, clearable, placeholder = "Chọn ngày", marks = [], className = "", invalid, withWeekday = true, ...rest }: Props) {
  const [open, setOpen] = useState(false);
  const today = todayVn();
  const base = value || today;
  const [view, setView] = useState(() => ({ y: parse(base).y, m: parse(base).m }));
  const [focus, setFocus] = useState(base);
  const [pos, setPos] = useState<CSSProperties>({});
  const root = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  function openPicker() {
    const start = value || today;
    setView({ y: parse(start).y, m: parse(start).m });
    setFocus(start);
    place();
    setOpen(true);
  }

  /** Đặt lịch ngay dưới ô (không đủ chỗ thì lên trên), mang theo màu nhấn của trang */
  function place() {
    const t = trigger.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const css = getComputedStyle(root.current ?? t);
    const width = 312;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    const up = window.innerHeight - r.bottom < 400 && r.top > 400;
    setPos({
      left,
      ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
      ["--dp-accent" as string]: css.getPropertyValue("--dp-accent"),
      ["--dp-accent-ink" as string]: css.getPropertyValue("--dp-accent-ink"),
    });
  }

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }

  function pick(s: string) {
    onChange(s);
    close();
  }

  // Bấm ra ngoài thì đóng
  useEffect(() => {
    if (!open) return;
    const h = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!root.current?.contains(t) && !pop.current?.contains(t)) setOpen(false);
    };
    // Cuộn hoặc đổi cỡ cửa sổ: đặt lại vị trí theo ô
    const re = () => place();
    document.addEventListener("pointerdown", h);
    window.addEventListener("resize", re);
    window.addEventListener("scroll", re, true);
    return () => {
      document.removeEventListener("pointerdown", h);
      window.removeEventListener("resize", re);
      window.removeEventListener("scroll", re, true);
    };
  }, [open]);

  // Đưa focus vào ô đang chọn mỗi khi di chuyển bằng bàn phím
  useLayoutEffect(() => {
    if (!open) return;
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focus}"]`)?.focus({ preventScroll: true });
  }, [open, focus, view]);

  function moveFocus(next: string) {
    setFocus(next);
    const { y, m } = parse(next);
    if (y !== view.y || m !== view.m) setView({ y, m });
  }

  function stepMonth(delta: number) {
    const d = new Date(Date.UTC(view.y, view.m - 1 + delta, 1));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    setView({ y, m });
    const day = Math.min(parse(focus).d, new Date(Date.UTC(y, m, 0)).getUTCDate());
    setFocus(ymd(y, m, day));
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in moves) {
      e.preventDefault();
      moveFocus(shift(focus, moves[e.key]));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      stepMonth(e.key === "PageUp" ? -1 : 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      moveFocus(shift(focus, -((weekday(focus) + 6) % 7)));
    } else if (e.key === "End") {
      e.preventDefault();
      moveFocus(shift(focus, 6 - ((weekday(focus) + 6) % 7)));
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  const cells = monthCells(view.y, view.m);
  const markOf = (s: string) => marks.find((x) => x.date === s);
  const shown = value || focus;
  const lunar = (() => {
    const { y, m, d } = parse(shown);
    const l = solarToLunar(d, m, y);
    return `${l.day}/${l.month}${l.leap ? " nhuận" : ""} năm ${yearName(l.year)}`;
  })();

  return (
    <div className={`dp ${open ? "is-open" : ""}`} ref={root}>
      <button
        ref={trigger}
        type="button"
        className={`dp-trigger ${className} ${value ? "" : "is-empty"} ${invalid ? "is-invalid" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={rest["aria-label"] ? `${rest["aria-label"]}: ${value ? formatViDate(value) : "chưa chọn"}` : undefined}
        onClick={() => (open ? close(false) : openPicker())}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16V20H4zM4 10.5h16M8.5 4v4M15.5 4v4" /></svg>
        <span>{value ? formatViDate(value, withWeekday) : placeholder}</span>
      </button>

      {open && createPortal(
        <div className="dp-layer">
          <div className="dp-backdrop" onClick={() => close()} aria-hidden="true" />
          <div className="dp-pop" ref={pop} style={pos} role="dialog" aria-modal="false" aria-labelledby={titleId} onKeyDown={onKey}>
            <div className="dp-head">
              <button type="button" className="dp-nav" aria-label="Năm trước" onClick={() => stepMonth(-12)}>«</button>
              <button type="button" className="dp-nav" aria-label="Tháng trước" onClick={() => stepMonth(-1)}>‹</button>
              <b id={titleId} aria-live="polite">Tháng {view.m}, {view.y}</b>
              <button type="button" className="dp-nav" aria-label="Tháng sau" onClick={() => stepMonth(1)}>›</button>
              <button type="button" className="dp-nav" aria-label="Năm sau" onClick={() => stepMonth(12)}>»</button>
            </div>

            <div className="dp-week" aria-hidden="true">
              {WEEK.map((w) => <span key={w} className={w === "CN" ? "sun" : ""}>{w}</span>)}
            </div>

            <div className="dp-grid" role="grid" aria-labelledby={titleId} ref={grid}>
              {cells.map((s) => {
                const { y, m, d } = parse(s);
                const l = solarToLunar(d, m, y);
                const mark = markOf(s);
                const other = m !== view.m;
                const cls = [
                  "dp-day",
                  other ? "other" : "",
                  s === today ? "today" : "",
                  s === value ? "selected" : "",
                  mark ? "marked" : "",
                  weekday(s) === 0 ? "sun" : "",
                ].join(" ");
                return (
                  <button
                    key={s}
                    type="button"
                    role="gridcell"
                    data-date={s}
                    className={cls}
                    tabIndex={s === focus ? 0 : -1}
                    aria-selected={s === value}
                    aria-current={s === today ? "date" : undefined}
                    aria-label={`${formatViDate(s)}${mark ? `, ${mark.label}` : ""}, âm lịch ${l.day}/${l.month}`}
                    title={mark?.label}
                    onClick={() => pick(s)}
                  >
                    <b>{d}</b>
                    <small>{l.day === 1 ? `${l.day}/${l.month}` : l.day}</small>
                    {mark && <i aria-hidden="true">♥</i>}
                  </button>
                );
              })}
            </div>

            <div className="dp-foot">
              <span className="dp-lunar">Âm lịch: <b>{lunar}</b></span>
              <span className="dp-acts">
                {clearable && value && <button type="button" className="dp-btn" onClick={() => pick("")}>Xóa</button>}
                <button type="button" className="dp-btn" onClick={() => moveFocus(today)}>Hôm nay</button>
                {marks.slice(0, 1).map((mk) => (
                  <button key={mk.date} type="button" className="dp-btn" onClick={() => moveFocus(mk.date)}>{mk.label}</button>
                ))}
              </span>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
