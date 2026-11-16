/** Tiền Việt: đọc số người dùng gõ ("12.500.000", "5tr", "500k", "1,2 tỷ") và hiển thị lại. */

const UNITS: Record<string, number> = {
  k: 1e3,
  nghin: 1e3,
  ngan: 1e3,
  tr: 1e6,
  trieu: 1e6,
  m: 1e6,
  ty: 1e9,
  ti: 1e9,
};

function strip(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/\s+/g, "");
}

/** Trả về số đồng (làm tròn), 0 nếu trống, null nếu không đọc được */
export function parseMoney(input: string): number | null {
  const s = strip(input).replace(/(vnd|d)$/, "");
  if (!s) return 0;
  const m = /^([\d.,]+)([a-z]*)$/.exec(s);
  if (!m) return null;
  const [, num, unit] = m;
  if (unit && !(unit in UNITS)) return null;
  let value: number;
  if (unit) {
    // Có đơn vị: dấu , hoặc . cuối cùng là dấu thập phân ("1,5tr", "2.5 tỷ")
    const parts = num.split(/[.,]/);
    const dec = parts.length > 1 ? parts.pop() : undefined;
    value = Number(parts.join("") + (dec !== undefined ? "." + dec : "")) * UNITS[unit];
  } else {
    // Không đơn vị: dấu chấm/phẩy là phân cách hàng nghìn
    value = Number(num.replace(/[.,]/g, ""));
  }
  return Number.isFinite(value) ? Math.round(value) : null;
}

/** "12.500.000" */
export function formatMoney(n: number): string {
  return Math.round(n).toLocaleString("vi-VN");
}

/** "12,5 tr", "1,2 tỷ", "500 k": gọn cho thẻ tổng quan */
export function formatMoneyShort(n: number): string {
  const abs = Math.abs(n);
  const fmt = (v: number) => v.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
  if (abs >= 1e9) return `${fmt(n / 1e9)} tỷ`;
  if (abs >= 1e6) return `${fmt(n / 1e6)} tr`;
  if (abs >= 1e3) return `${fmt(n / 1e3)} k`;
  return fmt(n);
}
