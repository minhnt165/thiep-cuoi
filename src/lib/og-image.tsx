import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { Invitation } from "@/lib/schema";
import { THEMES } from "@/lib/templates";
import { longDate, weekdayLabel } from "@/lib/dates";
import { getStore } from "@/lib/store";
import { toDataUrl } from "@/lib/images";
import { HEART_PATH } from "@/lib/icon-art";

export const OG_SIZE = { width: 1200, height: 630 };

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
    if (!bytes) return null;
    return await toDataUrl(bytes, 520, 630);
  } catch {
    return null;
  }
}

/** Ảnh 1200×630 hiện khi gửi link qua Zalo, Messenger, Facebook */
export async function ogImage(inv: Invitation): Promise<ImageResponse> {
  const theme = THEMES[inv.template];
  const c = theme.colors;
  const accent = inv.accent || c.accent;
  const [img, fontList] = await Promise.all([coverImage(inv), fonts()]);
  const ev = inv.mainEvent;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: c.bg, color: c.ink, fontFamily: "Cormorant" }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} width={520} height={630} style={{ objectFit: "cover" }} alt="" />
        ) : (
          <div style={{ width: 520, height: 630, display: "flex", alignItems: "center", justifyContent: "center", background: accent }}>
            <svg width="200" height="200" viewBox="0 0 100 100"><path d={HEART_PATH} fill={c.accentInk} /></svg>
          </div>
        )}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 48px", textAlign: "center" }}>
          <div style={{ fontSize: 22, letterSpacing: 8, textTransform: "uppercase", color: c.muted }}>{inv.texts.saveTheDate}</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 26, fontFamily: "Playfair", fontSize: 64, lineHeight: 1.15, color: accent }}>
            <span>{inv.groom.shortName}</span>
            <span style={{ fontFamily: "GreatVibes", fontSize: 48, color: c.muted, lineHeight: 1 }}>&amp;</span>
            <span>{inv.bride.shortName}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 30 }}>
            <div style={{ width: 70, height: 1, background: accent }} />
            <svg width="22" height="22" viewBox="0 0 100 100"><path d={HEART_PATH} fill={accent} /></svg>
            <div style={{ width: 70, height: 1, background: accent }} />
          </div>
          <div style={{ marginTop: 26, fontSize: 34 }}>{longDate(ev.date)}</div>
          <div style={{ marginTop: 6, fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: c.muted }}>{`${weekdayLabel(ev.date)} · ${ev.time}`}</div>
          {ev.venue && <div style={{ marginTop: 22, fontSize: 24, color: c.muted }}>{ev.venue}</div>}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fontList.map((f) => ({ name: f.name, data: f.data, style: "normal" as const, weight: 400 as const })) },
  );
}
