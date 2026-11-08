/**
 * Ghi danh sách file nhạc có trong public/music vào src/lib/music-files.json.
 * Chạy tự động trước `npm run dev` và `npm run build` (predev/prebuild), để
 * trình chỉnh sửa biết bài nào đã có file mà không phải dò từng file (gây 404).
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

const dir = "public/music";
const out = "src/lib/music-files.json";
const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.(mp3|m4a|ogg)$/i.test(f)).sort() : [];
const next = JSON.stringify(files) + "\n";
// chỉ ghi khi đổi, tránh làm bẩn git mỗi lần chạy
if (!existsSync(out) || readFileSync(out, "utf8") !== next) writeFileSync(out, next);
console.log(`music: ${files.length} file`);
