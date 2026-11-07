import { ImageResponse } from "next/og";
import { HEART_PATH, ICON_ACCENT, ICON_INK } from "@/lib/icon-art";

/**
 * Icon tròn + trái tim, sinh bằng code để đổi màu theo mẫu thiệp.
 * Dùng cho icon của từng thiệp (/[slug]) và trang demo.
 */
export function heartIcon(size: number, accent = ICON_ACCENT, ink = ICON_INK): ImageResponse {
  const inner = size * 0.56;
  const off = (size - inner) / 2;
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, display: "flex", background: "transparent" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={size / 2} fill={accent} />
          <g transform={`translate(${off} ${off + inner * 0.02}) scale(${inner / 100})`}>
            <path d={HEART_PATH} fill={ink} />
          </g>
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
