/**
 * Chụp lại ảnh bìa từng mẫu cho trang chủ (public/templates/<id>.webp, 840×1280).
 *
 * Cần dev server đang chạy (npm run dev) và playwright:
 *   npx playwright install chromium
 *   node scripts/shoot-templates.mjs
 *
 * Cách chụp: ép khung thiệp 420×640 rồi phóng 2x bằng transform để ảnh nét,
 * bỏ huy hiệu Next dev, chụp viewport 840×1280 và xuất WebP bằng sharp.
 */
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const IDS = ["marble-gold", "burgundy-envelope", "song-hy", "white-blossom", "sage-arch", "navy-gold", "blush-rose", "mono-minimal"];
const CSS = `html,body{overflow:hidden;background:#000;height:1280px}
.inv-root{width:420px!important;height:640px!important;min-height:0!important;transform:scale(2);transform-origin:0 0;overflow:hidden!important}
.inv,.inv.is-locked{height:640px!important;min-height:0!important} .cover{height:640px!important} nextjs-portal{display:none}`;

const { chromium } = await import("playwright").catch(() => {
  console.error("Chưa cài playwright: npm i -D playwright && npx playwright install chromium");
  process.exit(1);
});

mkdirSync("public/templates", { recursive: true });
// PW_CHANNEL=msedge (hoặc chrome) để dùng trình duyệt đã cài trên máy, khỏi tải chromium của playwright
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
const page = await browser.newPage({ viewport: { width: 840, height: 1280 } });
for (const id of IDS) {
  await page.goto(`${BASE}/demo/${id}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: CSS });
  await page.waitForTimeout(700);
  const png = await page.screenshot({ type: "png" });
  const { size } = await sharp(png).webp({ quality: 82 }).toFile(`public/templates/${id}.webp`);
  console.log(id, `${Math.round(size / 1024)}KB`);
}
await browser.close();
