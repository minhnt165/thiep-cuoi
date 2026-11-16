import { z } from "zod";
import type { Guest, Rsvp } from "@/lib/schema";
import { makeId } from "@/lib/schema";

/**
 * Sổ kế hoạch cưới của cô dâu chú rể: công việc, chi phí, tiền mừng.
 * Lưu riêng với thiệp (không bao giờ gửi cho khách). Danh sách khách vẫn nằm
 * trong thiệp (`Invitation.guests`) vì link riêng ?to= dùng chung.
 */

const trimmed = z.string().trim();
const ymdOrEmpty = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).default("");
const money = z.number().int().min(0).max(1e13).default(0);
const side = z.enum(["groom", "bride"]).default("groom");

/** Mốc công việc, số ngày so với ngày cưới */
export const PHASES = [
  { id: "m6", label: "Trước 6 tháng", offset: -180 },
  { id: "m3", label: "Trước 3 tháng", offset: -90 },
  { id: "m1", label: "Trước 1 tháng", offset: -30 },
  { id: "w2", label: "Trước 2 tuần", offset: -14 },
  { id: "w1", label: "Tuần cuối", offset: -5 },
  { id: "day", label: "Ngày cưới", offset: 0 },
  { id: "after", label: "Sau cưới", offset: 7 },
] as const;
export type PhaseId = (typeof PHASES)[number]["id"];
const PHASE_IDS = PHASES.map((p) => p.id) as [PhaseId, ...PhaseId[]];

export const EXPENSE_CATEGORIES = [
  { id: "party", label: "Tiệc cưới" },
  { id: "engagement", label: "Lễ ăn hỏi, tráp" },
  { id: "photo", label: "Ảnh, quay phim" },
  { id: "attire", label: "Trang phục" },
  { id: "rings", label: "Nhẫn, trang sức" },
  { id: "decor", label: "Trang trí, hoa" },
  { id: "makeup", label: "Trang điểm" },
  { id: "car", label: "Xe cưới" },
  { id: "music", label: "MC, ca nhạc" },
  { id: "cards", label: "Thiệp, quà cảm ơn" },
  { id: "honeymoon", label: "Tuần trăng mật" },
  { id: "other", label: "Khác" },
] as const;
export type CategoryId = (typeof EXPENSE_CATEGORIES)[number]["id"];
const CATEGORY_IDS = EXPENSE_CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];

export const PAYERS = { groom: "Nhà trai", bride: "Nhà gái", both: "Chung" } as const;
export const GIFT_METHODS = { cash: "Tiền mặt", transfer: "Chuyển khoản", gold: "Vàng", other: "Khác" } as const;

export const TaskSchema = z.object({
  id: trimmed.min(1),
  title: trimmed.max(200).default(""),
  phase: z.enum(PHASE_IDS).default("m1"),
  /** Hạn làm, YYYY-MM-DD hoặc rỗng */
  due: ymdOrEmpty,
  /** Ai phụ trách: "Chú rể", "Mẹ cô dâu"… */
  owner: trimmed.max(60).default(""),
  done: z.boolean().default(false),
});
export type Task = z.infer<typeof TaskSchema>;

export const ExpenseSchema = z.object({
  id: trimmed.min(1),
  category: z.enum(CATEGORY_IDS).default("other"),
  title: trimmed.max(200).default(""),
  vendor: trimmed.max(120).default(""),
  /** Dự kiến */
  estimate: money,
  /** Chốt giá thật (0 = chưa chốt, tính theo dự kiến) */
  actual: money,
  /** Đã trả / đã cọc */
  paid: money,
  payer: z.enum(["groom", "bride", "both"]).default("both"),
  note: trimmed.max(300).default(""),
});
export type Expense = z.infer<typeof ExpenseSchema>;

export const GiftSchema = z.object({
  id: trimmed.min(1),
  /** Khách trong danh sách (nếu ghi từ danh sách), rỗng nếu khách ngoài danh sách */
  guestId: trimmed.default(""),
  name: trimmed.max(120).default(""),
  side,
  amount: money,
  method: z.enum(["cash", "transfer", "gold", "other"]).default("cash"),
  note: trimmed.max(300).default(""),
  createdAt: z.string().default(() => new Date().toISOString()),
});
export type Gift = z.infer<typeof GiftSchema>;

export const PlanSchema = z.object({
  /** Ngân sách tổng hai bên đặt ra */
  budget: money,
  tasks: z.array(TaskSchema).max(500).default([]),
  expenses: z.array(ExpenseSchema).max(500).default([]),
  gifts: z.array(GiftSchema).max(3000).default([]),
  updatedAt: z.string().default(() => new Date().toISOString()),
});
export type Plan = z.infer<typeof PlanSchema>;

/* ---------- Ngày ---------- */

/** Ngày hôm nay theo giờ Việt Nam, YYYY-MM-DD */
export function vnToday(now = new Date()): string {
  return new Date(now.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
}

export function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Số ngày từ a đến b (b - a) */
export function daysBetween(a: string, b: string): number {
  const t = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((t(b) - t(a)) / 86400_000);
}

/* ---------- Danh sách việc mẫu ---------- */

const DEFAULT_TASKS: [PhaseId, string, string][] = [
  ["m6", "Thống nhất ngân sách và quy mô đám cưới", "Cả hai"],
  ["m6", "Xem ngày ăn hỏi, ngày cưới", "Hai nhà"],
  ["m6", "Lập danh sách khách mời sơ bộ", "Cả hai"],
  ["m6", "Chọn và đặt cọc nhà hàng tổ chức tiệc", "Cả hai"],
  ["m6", "Chọn studio, đặt lịch chụp ảnh cưới", "Cả hai"],
  ["m3", "Chụp ảnh cưới", "Cả hai"],
  ["m3", "Chọn váy cưới, áo dài, vest", "Cả hai"],
  ["m3", "Mua nhẫn cưới", "Chú rể"],
  ["m3", "Đặt trang trí, hoa cưới, cổng hoa", "Cả hai"],
  ["m3", "Đặt MC, ban nhạc", "Chú rể"],
  ["m3", "Đặt trang điểm cô dâu", "Cô dâu"],
  ["m1", "Làm thiệp cưới online và in thiệp giấy", "Cả hai"],
  ["m1", "Đăng ký kết hôn", "Cả hai"],
  ["m1", "Đặt xe hoa, xe đưa đón họ hàng", "Chú rể"],
  ["m1", "Chuẩn bị tráp ăn hỏi, chọn đội bê tráp", "Nhà trai"],
  ["m1", "Chọn phù dâu, phù rể", "Cả hai"],
  ["w2", "Gửi hết thiệp, gọi điện mời người lớn", "Cả hai"],
  ["w2", "Chốt số bàn với nhà hàng", "Cả hai"],
  ["w2", "Thử trang phục lần cuối", "Cả hai"],
  ["w1", "Chốt lịch trình ngày cưới, phân công người lo từng việc", "Hai nhà"],
  ["w1", "Thanh toán các khoản còn lại cho dịch vụ", "Cả hai"],
  ["w1", "Chuẩn bị phong bì, sổ ghi tiền mừng, người giữ hòm", "Hai nhà"],
  ["w1", "Nhắc khách qua tin nhắn kèm link thiệp", "Cả hai"],
  ["day", "Kiểm tra nhẫn, giấy tờ, phong bì cảm ơn", "Cả hai"],
  ["after", "Nhắn cảm ơn khách đã đến và gửi quà", "Cả hai"],
  ["after", "Tổng kết tiền mừng, chi phí", "Cả hai"],
  ["after", "Nhận ảnh, video cưới", "Cả hai"],
];

/**
 * Kế hoạch mới cho thiệp chưa có kế hoạch: sẵn danh sách việc theo mốc.
 * Hạn mỗi việc tính từ ngày cưới; mốc đã qua thì để trống hạn (không báo quá hạn oan).
 */
export function seedPlan(weddingYmd: string, today = vnToday()): Plan {
  const offsets = Object.fromEntries(PHASES.map((p) => [p.id, p.offset])) as Record<PhaseId, number>;
  return {
    budget: 0,
    tasks: DEFAULT_TASKS.map(([phase, title, owner]) => {
      const due = addDays(weddingYmd, offsets[phase]);
      return { id: makeId(), title, phase, owner, due: due >= today ? due : "", done: false };
    }),
    expenses: [],
    gifts: [],
    updatedAt: new Date().toISOString(),
  };
}

/* ---------- Tính toán ---------- */

/** Số tiền của khoản chi: đã chốt giá thì theo giá chốt, chưa thì theo dự kiến */
export function expenseCost(e: Expense): number {
  return e.actual > 0 ? e.actual : e.estimate;
}

export function expenseRemaining(e: Expense): number {
  return Math.max(0, expenseCost(e) - e.paid);
}

export function isOverdue(t: Task, today: string): boolean {
  return !t.done && t.due !== "" && t.due < today;
}

/** So tên không phân biệt hoa thường, dấu cách thừa */
export function sameName(a: string, b: string): boolean {
  const n = (s: string) => s.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
  return n(a) !== "" && n(a) === n(b);
}

/** Xác nhận tham dự của một khách: khớp tên trên link riêng trước, rồi tới tên khách tự điền */
export function rsvpFor(guest: Guest, rsvps: Rsvp[]): Rsvp | undefined {
  return rsvps.find((r) => sameName(r.invitedAs, guest.name)) ?? rsvps.find((r) => sameName(r.name, guest.name));
}

/** Tổng tiền mừng của một khách */
export function giftsFor(guest: Guest, gifts: Gift[]): number {
  return gifts.filter((g) => (g.guestId ? g.guestId === guest.id : sameName(g.name, guest.name))).reduce((n, g) => n + g.amount, 0);
}

export function sum<T>(list: T[], f: (x: T) => number): number {
  return list.reduce((n, x) => n + f(x), 0);
}

export function summarize(plan: Plan, guests: Guest[], rsvps: Rsvp[], today = vnToday()) {
  const tasksDone = plan.tasks.filter((t) => t.done).length;
  const cost = sum(plan.expenses, expenseCost);
  const paid = sum(plan.expenses, (e) => Math.min(e.paid, expenseCost(e) || e.paid));
  const yes = rsvps.filter((r) => r.attending);
  return {
    tasks: {
      total: plan.tasks.length,
      done: tasksDone,
      overdue: plan.tasks.filter((t) => isOverdue(t, today)).length,
    },
    money: {
      budget: plan.budget,
      cost,
      paid,
      remaining: sum(plan.expenses, expenseRemaining),
    },
    guests: {
      names: guests.length,
      people: sum(guests, (g) => g.count),
      sent: guests.filter((g) => g.sent).length,
      confirmed: yes.length,
      confirmedPeople: sum(yes, (r) => r.guests),
      declined: rsvps.length - yes.length,
    },
    gifts: {
      count: plan.gifts.length,
      total: sum(plan.gifts, (g) => g.amount),
      groom: sum(plan.gifts.filter((g) => g.side === "groom"), (g) => g.amount),
      bride: sum(plan.gifts.filter((g) => g.side === "bride"), (g) => g.amount),
    },
  };
}
