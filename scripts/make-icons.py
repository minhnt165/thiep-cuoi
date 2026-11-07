"""Tạo bộ favicon: icon.svg, favicon.ico, PNG 192/512, apple-touch-icon và đường path trái tim dùng chung."""
import math, os, sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ACCENT = (0xA8, 0x89, 0x4F)   # vàng đồng, màu nhấn mẫu cẩm thạch
INK = (0xFF, 0xF9, 0xEC)      # kem
BG = (0xF6, 0xEF, 0xE3)       # nền apple icon

def heart_points(n=160):
    """Trái tim tham số, chuẩn hóa vào ô 0..1 (tâm 0.5, 0.5)."""
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((x, -y))
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    w = max(xs) - min(xs); h = max(ys) - min(ys); s = max(w, h)
    return [((x - min(xs)) / s + (1 - w / s) / 2, (y - min(ys)) / s + (1 - h / s) / 2) for x, y in pts]

HEART = heart_points()

def heart_path(scale, ox, oy, digits=2):
    return "M" + "L".join(f"{ox + x * scale:.{digits}f} {oy + y * scale:.{digits}f}" for x, y in HEART) + "Z"

def draw_icon(size, bg=None, pad=0.0):
    """Hình tròn màu nhấn + trái tim kem. Vẽ ở 4x rồi thu nhỏ để mịn."""
    S = size * 4
    im = Image.new("RGBA", (S, S), bg + (255,) if bg else (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    m = S * pad
    d.ellipse((m, m, S - m, S - m), fill=ACCENT + (255,))
    inner = (S - 2 * m) * 0.56
    ox = (S - inner) / 2; oy = (S - inner) / 2 + inner * 0.02
    d.polygon([(ox + x * inner, oy + y * inner) for x, y in HEART], fill=INK + (255,))
    return im.resize((size, size), Image.LANCZOS)

# PNG cho manifest và apple
draw_icon(192).save(f"{ROOT}/public/icon-192.png")
draw_icon(512).save(f"{ROOT}/public/icon-512.png")
draw_icon(512, bg=BG, pad=0.10).save(f"{ROOT}/public/icon-512-maskable.png")
draw_icon(180, bg=BG, pad=0.08).save(f"{ROOT}/src/app/apple-icon.png")

# favicon.ico nhiều cỡ
base = draw_icon(64)
base.save(f"{ROOT}/src/app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# icon.svg
acc = "#%02X%02X%02X" % ACCENT; ink = "#%02X%02X%02X" % INK
svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="{acc}"/><path d="{heart_path(36, 14, 14.7)}" fill="{ink}"/></svg>"""
open(f"{ROOT}/src/app/icon.svg", "w", encoding="utf8", newline="\n").write(svg + "\n")

# path trái tim trong viewBox 0..100 cho icon sinh bằng code
tsx = f'''/** Trái tim dùng chung cho favicon và icon sinh bằng code. Sinh bởi scripts/make-icons.py, đừng sửa tay. */
export const HEART_PATH = "{heart_path(100, 0, 0, 1)}";
export const ICON_ACCENT = "{acc}";
export const ICON_INK = "{ink}";
'''
open(f"{ROOT}/src/lib/icon-art.ts", "w", encoding="utf8", newline="\n").write(tsx)
print("ok", len(HEART))
