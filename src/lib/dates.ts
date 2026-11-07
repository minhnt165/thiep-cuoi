/** Tiện ích ngày giờ cho thiệp. Mọi ngày trong thiệp hiểu theo giờ Việt Nam. */

const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export function parseYmd(ymd: string): { y: number; m: number; d: number } {
  const [y, m, d] = ymd.split("-").map(Number);
  return { y, m, d };
}

/** Date object tại giờ Việt Nam (+07:00) */
export function toVnDate(ymd: string, hm = "00:00"): Date {
  return new Date(`${ymd}T${hm}:00+07:00`);
}

export function weekdayLabel(ymd: string): string {
  const { y, m, d } = parseYmd(ymd);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** "20.12.2026" */
export function dotDate(ymd: string): string {
  const { y, m, d } = parseYmd(ymd);
  return `${pad(d)}.${pad(m)}.${y}`;
}

/** "20 tháng 12, 2026" */
export function longDate(ymd: string): string {
  const { y, m, d } = parseYmd(ymd);
  return `${d} tháng ${m}, ${y}`;
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Lưới lịch tháng: hàng đầu là thứ (T2…CN), ô trống trước ngày 1 */
export function monthGrid(ymd: string): { year: number; month: number; cells: (number | null)[] } {
  const { y, m } = parseYmd(ymd);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7; // T2 = 0
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (number | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return { year: y, month: m, cells };
}

export function countdown(target: Date, now = new Date()): { days: number; hours: number; minutes: number; seconds: number; passed: boolean } {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  const s = Math.floor(ms / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor(s / 3600) % 24, minutes: Math.floor(s / 60) % 60, seconds: s % 60, passed: false };
}

/** Link "Thêm vào lịch" của Google Calendar, 3 tiếng kể từ giờ bắt đầu */
export function googleCalendarUrl(opts: { title: string; ymd: string; hm: string; location: string; details?: string }): string {
  const { y, m, d } = parseYmd(opts.ymd);
  const [hh, mm] = opts.hm.split(":").map(Number);
  const start = `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`;
  const endH = (hh + 3) % 24;
  const end = `${y}${pad(m)}${pad(d)}T${pad(endH)}${pad(mm)}00`;
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${start}/${end}`,
    location: opts.location,
    details: opts.details ?? "",
    ctz: "Asia/Ho_Chi_Minh",
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function mapsUrl(address: string, mapUrl?: string): string {
  if (mapUrl) return mapUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function formatWishTime(iso: string): string {
  const d = new Date(iso);
  const vn = new Date(d.getTime() + 7 * 3600 * 1000);
  return `${pad(vn.getUTCHours())}:${pad(vn.getUTCMinutes())} ${vn.getUTCDate()}/${vn.getUTCMonth() + 1}/${vn.getUTCFullYear()}`;
}
