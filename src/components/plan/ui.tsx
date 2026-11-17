"use client";

import { useState, type InputHTMLAttributes } from "react";
import type { Guest, Invitation, Rsvp } from "@/lib/schema";
import type { Plan } from "@/lib/plan";
import { formatMoney, parseMoney } from "@/lib/money";
import { buildXlsx, type SheetSpec } from "@/lib/xlsx";

/** Sửa bản nháp kiểu Immer: hàm nhận bản sao, sửa tại chỗ */
export type Update<T> = (fn: (draft: T) => void) => void;

export type TabId = "overview" | "tasks" | "budget" | "guests" | "gifts";

export interface PageProps {
  inv: Invitation;
  plan: Plan;
  setPlan: Update<Plan>;
  guests: Guest[];
  setGuests: Update<Guest[]>;
  rsvps: Rsvp[];
  today: string;
  go: (tab: TabId) => void;
}

/**
 * Ô nhập tiền: gõ "500k", "1,5tr", "12.500.000" đều được. Đang gõ thì giữ
 * nguyên chữ người dùng, rời ô thì hiện lại dạng 12.500.000.
 */
export function MoneyInput({ value, onChange, ...rest }: { value: number; onChange: (n: number) => void } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const [text, setText] = useState<string | null>(null);
  const shown = text ?? (value ? formatMoney(value) : "");
  const bad = text !== null && parseMoney(text) === null;
  return (
    <input
      inputMode="decimal"
      autoComplete="off"
      {...rest}
      value={shown}
      aria-invalid={bad || undefined}
      title={bad ? "Gõ số tiền, ví dụ 500k, 1,5tr, 2.000.000" : rest.title}
      onFocus={(e) => {
        setText(value ? formatMoney(value) : "");
        rest.onFocus?.(e);
      }}
      onChange={(e) => {
        setText(e.target.value);
        const n = parseMoney(e.target.value);
        if (n !== null) onChange(n);
      }}
      onBlur={(e) => {
        setText(null);
        rest.onBlur?.(e);
      }}
    />
  );
}

/** "12.500.000 đ" */
export function Vnd({ n, className }: { n: number; className?: string }) {
  return <span className={className}>{formatMoney(n)}&nbsp;đ</span>;
}

/** Thanh tiến độ; vượt max thì đổi màu cảnh báo */
export function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const over = max > 0 && value > max;
  return (
    <div className={`pl-bar ${over ? "over" : ""}`} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stat({ label, children, tone }: { label: string; children: React.ReactNode; tone?: "warn" | "ok" }) {
  return (
    <div className={`pl-stat ${tone ?? ""}`}>
      <span>{label}</span>
      <b>{children}</b>
    </div>
  );
}

/** Tải bảng thành file Excel .xlsx (tiêu đề đậm, bộ lọc, số tiền là số, dòng tổng) */
export function downloadXlsx(fileName: string, spec: SheetSpec) {
  const bytes = buildXlsx(spec);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Sao chép và nhớ nút nào vừa bấm để đổi chữ "Đã sao chép" */
export function useCopy() {
  const [copied, setCopied] = useState("");
  async function copy(text: string, which: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* trình duyệt chặn clipboard, bỏ qua */
    }
  }
  return { copied, copy };
}

export const SIDES = { groom: "Nhà trai", bride: "Nhà gái" } as const;

/** Chữ cái đầu của tên cuối: "Gia đình anh Hùng" → "H" */
function initial(name: string): string {
  const last = name.trim().split(/\s+/).pop() ?? "";
  return last.charAt(0).toLocaleUpperCase("vi") || "?";
}

/** Vòng tròn chữ cái, viền theo bên (màu đi kèm chữ "Nhà trai/Nhà gái" nên không chỉ dựa vào màu) */
export function Avatar({ name, side }: { name: string; side: "groom" | "bride" }) {
  return <span className={`pl-av ${side}`} aria-hidden="true">{initial(name)}</span>;
}

/** Vòng tiến độ (một chuỗi số liệu, không cần chú giải: tiêu đề thẻ gọi tên) */
export function Ring({ value, max, size = 64, label }: { value: number; max: number; size?: number; label: string }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <svg className="pl-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${Math.round(pct * 100)}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} className="track" />
      <circle cx={size / 2} cy={size / 2} r={r} className="fill" strokeDasharray={`${c * pct} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle">{Math.round(pct * 100)}%</text>
    </svg>
  );
}

/**
 * Thanh tách nhà trai / nhà gái: hai màu phân loại (đã kiểm tra mù màu),
 * luôn kèm chú giải chữ, rê chuột vào từng đoạn hiện số.
 */
export function SplitBar({ groom, bride, format }: { groom: number; bride: number; format: (n: number) => string }) {
  const total = groom + bride;
  const seg = (k: "groom" | "bride", v: number) =>
    v > 0 && (
      <span className={`seg ${k}`} style={{ flexGrow: v }} tabIndex={0} aria-label={`${SIDES[k]}: ${format(v)}`}>
        <span className="pl-tip" role="tooltip">{SIDES[k]}: <b>{format(v)}</b> · {Math.round((v / total) * 100)}%</span>
      </span>
    );
  return (
    <div className="pl-split">
      <div className="pl-split-bar">{total > 0 ? (<>{seg("groom", groom)}{seg("bride", bride)}</>) : <span className="seg empty" />}</div>
      <div className="pl-legend">
        <span><i className="groom" />Nhà trai <b>{format(groom)}</b></span>
        <span><i className="bride" />Nhà gái <b>{format(bride)}</b></span>
      </div>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="pl-empty">
      <svg viewBox="0 0 120 60" aria-hidden="true"><path d="M10 50C30 10 50 10 60 30S90 50 110 10" /><circle cx="60" cy="30" r="4" /></svg>
      <b>{title}</b>
      {children && <p className="hint">{children}</p>}
    </div>
  );
}
