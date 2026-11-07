import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { Invitation } from "@/lib/schema";
import { THEMES } from "@/lib/templates";
import { parseYmd, weekdayLabel } from "@/lib/dates";
import { getStore } from "@/lib/store";
import { toDataUrl } from "@/lib/images";
import { HEART_PATH } from "@/lib/icon-art";

export const OG_SIZE = { width: 1200, height: 630 };
const PHOTO_W = 560;

const MONTHS = ["", "Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu", "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"];

const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");
let fontsCache: Promise<{ name: string; data: Buffer }[]> | null = null;
function fonts() {
  fontsCache ??= Promise.all([
    ["Playfair", "PlayfairDisplay-Regular.ttf"],
    ["Cormorant", "CormorantGaramond-Medium.ttf"],
    ["GreatVibes", "GreatVibes-Regular.ttf"],
  ].map(async ([name, file]) => ({ name, data: await readFile(path.join(FONT_DIR, file)) })));
  return fontsCache;
}

/** Lấy ảnh cưới làm data URL để nhúng vào ảnh xem trước; null nếu chưa có ảnh */
async function coverImage(inv: Invitation): Promise<string | null> {
  const src = inv.photos.cover || inv.photos.saveTheDate[0] || inv.photos.album[0];
  if (!src) return null;
  try {
    let bytes: Uint8Array | null = null;
    const m = src.match(/^\/api\/files\/([a-z0-9-]+)\/([^/?]+)$/);
    const store = await getStore();
    if (m && store.readUpload) bytes = (await store.readUpload(m[1], m[2]))?.data ?? null;
    else if (src.startsWith("http")) bytes = new Uint8Array(await (await fetch(src)).arrayBuffer());
    // ảnh tĩnh trong public/ (ảnh demo)
    else if (src.startsWith("/") && !src.includes("..")) bytes = new Uint8Array(await readFile(path.join(process.cwd(), "public", src)));
    if (!bytes) return null;
    return await toDataUrl(bytes, PHOTO_W, OG_SIZE.height);
  } catch {
    return null;
  }
}

/** Chuyển #rrggbb thành rgba(...) để pha trong gradient (satori không hiểu color-mix) */
function rgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/**
 * Ảnh 1200×630 hiện khi gửi link qua Zalo, Messenger, Facebook.
 * Trái: ảnh cưới tràn cạnh, mờ dần vào nền. Phải: khung viền kim đôi, tên, ngày, địa điểm.
 */
export async function ogImage(inv: Invitation): Promise<ImageResponse> {
  const theme = THEMES[inv.template];
  const c = theme.colors;
  const accent = inv.accent || c.accent;
  const [img, fontList] = await Promise.all([coverImage(inv), fonts()]);
  const ev = inv.mainEvent;
  const { y, m, d } = parseYmd(ev.date);
  const initials = `${inv.groom.shortName.slice(0, 1)} & ${inv.bride.shortName.slice(0, 1)}`;
  const heart = (size: number, fill: string) => (
    <svg width={size} height={size} viewBox="0 0 100 100"><path d={HEART_PATH} fill={fill} /></svg>
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: c.bg, color: c.ink, fontFamily: "Cormorant" }}>
        {/* ảnh bên trái */}
        <div style={{ width: PHOTO_W, height: "100%", display: "flex", position: "relative", overflow: "hidden" }}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} width={PHOTO_W} height={OG_SIZE.height} style={{ objectFit: "cover" }} alt="" />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `radial-gradient(circle at 35% 30%, ${rgba(c.gold, 0.35)}, ${accent} 70%)` }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: c.accentInk }}>
                <div style={{ fontFamily: "GreatVibes", fontSize: 150, lineHeight: 1 }}>{initials}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
                  <div style={{ width: 60, height: 1, background: c.gold }} />
                  {heart(22, c.gold)}
                  <div style={{ width: 60, height: 1, background: c.gold }} />
                </div>
              </div>
            </div>
          )}
          {/* mờ dần vào nền để ảnh liền với phần chữ */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 140, height: "100%", background: `linear-gradient(90deg, ${rgba(c.bg, 0)}, ${c.bg})` }} />
          <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 120, background: `linear-gradient(180deg, ${rgba(c.bg, 0)}, ${rgba(c.bg, 0.35)})` }} />
        </div>

        {/* khung viền kim đôi */}
        <div style={{ position: "absolute", top: 22, left: 22, right: 22, bottom: 22, border: `1px solid ${rgba(c.gold, 0.9)}`, borderRadius: 4 }} />
        <div style={{ position: "absolute", top: 30, left: 30, right: 30, bottom: 30, border: `1px solid ${rgba(c.gold, 0.45)}`, borderRadius: 2 }} />

        {/* phần chữ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 56px 40px 36px", textAlign: "center" }}>
          <div style={{ fontSize: 20, letterSpacing: 9, textTransform: "uppercase", color: c.muted }}>Thiệp mời cưới</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 18, fontFamily: "Playfair", fontSize: 62, lineHeight: 1.12, color: accent }}>
            <span>{inv.groom.shortName}</span>
            <span style={{ fontFamily: "GreatVibes", fontSize: 54, color: c.gold, lineHeight: 0.9, marginTop: 4, marginBottom: 2 }}>&amp;</span>
            <span>{inv.bride.shortName}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24 }}>
            <div style={{ width: 90, height: 1, background: c.gold }} />
            {heart(20, c.gold)}
            <div style={{ width: 90, height: 1, background: c.gold }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 22 }}>
            <div style={{ fontFamily: "Playfair", fontSize: 82, lineHeight: 1, color: c.ink, paddingRight: 20, borderRight: `1px solid ${rgba(c.ink, 0.5)}` }}>{String(d).padStart(2, "0")}</div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <div style={{ fontSize: 24, letterSpacing: 4, textTransform: "uppercase" }}>{MONTHS[m]}</div>
              {/* satori chỉ nhận con là chuỗi, số sẽ lỗi "div nhiều con" */}
              <div style={{ fontFamily: "Playfair", fontSize: 34, lineHeight: 1.1 }}>{String(y)}</div>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: c.muted }}>{`${weekdayLabel(ev.date)} · ${ev.time}`}</div>
          {ev.venue && <div style={{ marginTop: 18, fontSize: 26, color: c.ink, maxWidth: 520 }}>{ev.venue}</div>}
          {ev.address && <div style={{ marginTop: 2, fontSize: 19, color: c.muted, maxWidth: 520 }}>{ev.address}</div>}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fontList.map((f) => ({ name: f.name, data: f.data, style: "normal" as const, weight: 400 as const })) },
  );
}
