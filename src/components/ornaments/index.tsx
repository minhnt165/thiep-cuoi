import type { SVGProps } from "react";

/* Họa tiết vẽ tay bằng SVG, bản quyền thuộc dự án. Màu lấy từ CSS variable của theme. */

type P = SVGProps<SVGSVGElement>;

/** Cành lá vàng kim mảnh, dùng cho mẫu cẩm thạch */
export function GoldLeafSprig(props: P) {
  const leaf = (x: number, y: number, r: number, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0C10-14 26-18 40-12 28 2 12 6 0 0Z"/></g>`;
  const leaves = [
    leaf(40, 150, -60), leaf(52, 125, -40), leaf(66, 102, -25), leaf(82, 84, -10), leaf(100, 70, 5), leaf(120, 60, 15),
    leaf(36, 120, -140, 0.8), leaf(50, 96, -130, 0.8), leaf(66, 76, -120, 0.8), leaf(86, 60, -110, 0.8),
  ].join("");
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="gl" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#B08A3E" />
          <stop offset="0.5" stopColor="#E8CB7F" />
          <stop offset="1" stopColor="#C09A4A" />
        </linearGradient>
      </defs>
      <path d="M30 170C50 130 80 95 150 50" fill="none" stroke="url(#gl)" strokeWidth="1.6" strokeLinecap="round" />
      <g fill="url(#gl)" opacity="0.95" dangerouslySetInnerHTML={{ __html: leaves }} />
      <g fill="#E8CB7F">
        <circle cx="156" cy="44" r="3" />
        <circle cx="166" cy="36" r="2.2" />
        <circle cx="150" cy="30" r="1.8" />
        <circle cx="20" cy="40" r="2" />
        <circle cx="28" cy="28" r="1.4" />
      </g>
    </svg>
  );
}

/** Chùm hoa hồng đỏ rượu với hoa nhỏ kem, dùng cho mẫu đỏ rượu */
export function RoseCluster(props: P) {
  const rose = (x: number, y: number, r: number) => (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#6E1A28" />
      <path d={`M${-r * 0.9} ${-r * 0.2}C${-r * 0.5} ${-r} ${r * 0.5} ${-r} ${r * 0.9} ${-r * 0.2}C${r * 0.4} ${-r * 0.5} ${-r * 0.4} ${-r * 0.5} ${-r * 0.9} ${-r * 0.2}Z`} fill="#9A2A3E" opacity="0.9" />
      <path d={`M${-r * 0.8} ${r * 0.3}C${-r * 0.3} ${r * 0.95} ${r * 0.3} ${r * 0.95} ${r * 0.8} ${r * 0.3}C${r * 0.3} ${r * 0.45} ${-r * 0.3} ${r * 0.45} ${-r * 0.8} ${r * 0.3}Z`} fill="#4E0F1A" opacity="0.8" />
      <circle r={r * 0.45} fill="#8E2235" />
      <path d={`M${-r * 0.35} ${-r * 0.1}C${-r * 0.15} ${-r * 0.4} ${r * 0.15} ${-r * 0.4} ${r * 0.35} ${-r * 0.1}`} fill="none" stroke="#C25A66" strokeWidth={r * 0.12} />
      <circle r={r * 0.16} fill="#C25A66" />
    </g>
  );
  const bud = (x: number, y: number, r: number) => (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#F2E6D2" />
      <circle r={r * 0.6} fill="#E7D2B4" />
      <circle r={r * 0.22} fill="#C9A24A" />
    </g>
  );
  return (
    <svg viewBox="0 0 200 180" aria-hidden="true" {...props}>
      <g fill="#5F6B4A">
        <path d="M30 140C40 110 70 100 100 108 76 126 54 136 30 140Z" />
        <path d="M120 150c20-14 44-12 60 4-20 10-42 10-60-4Z" />
        <path d="M60 60C58 40 70 24 90 22 88 42 78 56 60 60Z" />
        <path d="M150 70c6-18 24-28 42-24-6 18-22 28-42 24Z" />
      </g>
      <path d="M90 100C100 80 120 60 140 50M70 110C60 90 40 80 20 90" fill="none" stroke="#6B4A3A" strokeWidth="1.2" />
      {rose(96, 92, 30)}
      {rose(150, 62, 20)}
      {rose(50, 120, 17)}
      {bud(132, 112, 9)}
      {bud(70, 70, 7)}
      {bud(172, 100, 6)}
      <g fill="#C9A24A">
        <circle cx="26" cy="60" r="2.2" />
        <circle cx="34" cy="48" r="1.6" />
        <circle cx="180" cy="36" r="2" />
        <circle cx="190" cy="48" r="1.4" />
      </g>
    </svg>
  );
}

/** Chùm hoa trắng năm cánh, lá xanh */
export function BlossomCluster(props: P) {
  const flower = (x: number, y: number, r: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.62} rx={r * 0.42} ry={r * 0.62} fill="#FFFFFF" stroke="#D8D6C8" strokeWidth="0.7" transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.2} fill="#E3C46B" />
      <circle r={r * 0.08} fill="#B89236" />
    </g>
  );
  return (
    <svg viewBox="0 0 160 140" aria-hidden="true" {...props}>
      <g fill="#8FA889">
        <path d="M30 100C40 70 70 60 96 70 76 88 56 100 30 100Z" />
        <path d="M90 30c20-10 44-2 54 16-20 6-40 2-54-16Z" />
        <path d="M60 120c4-20 20-30 38-28-6 16-18 26-38 28Z" />
        <path d="M118 96c14 4 24 16 22 30-14-4-22-14-22-30Z" />
      </g>
      <path d="M40 98C60 80 80 70 110 40" fill="none" stroke="#6F8A6B" strokeWidth="1" />
      {flower(80, 68, 34, 10)}
      {flower(124, 52, 22, 40)}
      {flower(44, 48, 18, -20)}
      <g fill="#E3C46B">
        <circle cx="104" cy="104" r="3" />
        <circle cx="112" cy="110" r="2.4" />
        <circle cx="98" cy="112" r="2" />
      </g>
    </svg>
  );
}

/** Cành bạch đàn lá tròn, xanh sage, dùng cho mẫu Xanh sage vòm */
export function EucalyptusSprig(props: P) {
  const leaf = (x: number, y: number, r: number, rot: number, fill: string) => (
    <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={r} ry={r * 0.86} fill={fill} transform={`rotate(${rot} ${x} ${y})`} />
  );
  const pairs: [number, number, number][] = [[46, 150, 13], [62, 126, 12.5], [80, 104, 12], [100, 84, 11], [120, 68, 10], [140, 54, 9]];
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true" {...props}>
      <path d="M30 172C58 140 90 100 164 44" fill="none" stroke="#7A8A72" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M62 126c-12-2-22 2-30 8M100 84c-12-4-24-2-34 4M140 54c-10-6-22-6-32-2" fill="none" stroke="#7A8A72" strokeWidth="0.9" strokeLinecap="round" />
      {pairs.map(([x, y, r], i) => leaf(x - 12, y + 4, r, -30 + i * 4, "#9FB196"))}
      {pairs.map(([x, y, r], i) => leaf(x + 10, y - 8, r * 0.92, 20 - i * 3, "#B7C7AC"))}
      {leaf(160, 40, 7, 10, "#C9D6BF")}
      <g fill="#C8B27A">
        <circle cx="26" cy="140" r="2.2" />
        <circle cx="18" cy="152" r="1.5" />
        <circle cx="168" cy="30" r="1.8" />
      </g>
    </svg>
  );
}

/** Chùm hoa mẫu đơn hồng phấn nhiều lớp cánh, dùng cho mẫu Hồng phấn */
export function PeonyCluster(props: P) {
  const peony = (x: number, y: number, r: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <ellipse key={`o${a}`} cx="0" cy={-r * 0.6} rx={r * 0.46} ry={r * 0.64} fill="#F2C9CE" stroke="#E4A9B2" strokeWidth="0.6" transform={`rotate(${a})`} />
      ))}
      {[22, 82, 142, 202, 262, 322].map((a) => (
        <ellipse key={`m${a}`} cx="0" cy={-r * 0.38} rx={r * 0.34} ry={r * 0.46} fill="#F7DADD" stroke="#E4A9B2" strokeWidth="0.5" transform={`rotate(${a})`} />
      ))}
      {[0, 90, 180, 270].map((a) => (
        <ellipse key={`i${a}`} cx="0" cy={-r * 0.18} rx={r * 0.22} ry={r * 0.28} fill="#EBB3BB" transform={`rotate(${a + 30})`} />
      ))}
      <circle r={r * 0.14} fill="#D3A96A" />
    </g>
  );
  return (
    <svg viewBox="0 0 200 180" aria-hidden="true" {...props}>
      <g fill="#8FA58C">
        <path d="M28 142C40 112 70 100 102 110 80 128 56 138 28 142Z" />
        <path d="M118 150c22-14 46-10 62 8-20 8-44 8-62-8Z" />
        <path d="M56 60C54 40 68 24 88 24 86 44 76 58 56 60Z" />
        <path d="M152 76c6-20 24-30 44-26-6 18-24 30-44 26Z" />
      </g>
      <path d="M94 98C104 80 122 64 142 54M74 108C62 92 44 84 24 92" fill="none" stroke="#7E8F79" strokeWidth="1.1" />
      {peony(98, 92, 34, 12)}
      {peony(152, 60, 23, -20)}
      {peony(50, 120, 19, 30)}
      <g fill="#D3A96A">
        <circle cx="26" cy="62" r="2.2" />
        <circle cx="36" cy="50" r="1.5" />
        <circle cx="180" cy="38" r="2" />
        <circle cx="190" cy="52" r="1.3" />
      </g>
    </svg>
  );
}

/** Chùm sao bốn cánh vàng kim rải thưa, dùng cho mẫu Xanh đêm sao */
export function StarCluster(props: P) {
  const star = (x: number, y: number, s: number, o = 1) => (
    <path key={`${x}-${y}`} d={`M${x} ${y - s}C${x + s * 0.12} ${y - s * 0.3} ${x + s * 0.3} ${y - s * 0.12} ${x + s} ${y}C${x + s * 0.3} ${y + s * 0.12} ${x + s * 0.12} ${y + s * 0.3} ${x} ${y + s}C${x - s * 0.12} ${y + s * 0.3} ${x - s * 0.3} ${y + s * 0.12} ${x - s} ${y}C${x - s * 0.3} ${y - s * 0.12} ${x - s * 0.12} ${y - s * 0.3} ${x} ${y - s}Z`} fill="#E8CB7F" opacity={o} />
  );
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true" {...props}>
      {star(40, 40, 16)}
      {star(86, 24, 8, 0.9)}
      {star(22, 92, 7, 0.8)}
      {star(66, 74, 11, 0.95)}
      {star(118, 56, 5, 0.7)}
      {star(96, 108, 6, 0.75)}
      {star(140, 30, 9, 0.85)}
      <g fill="#E8CB7F">
        <circle cx="58" cy="52" r="1.4" />
        <circle cx="110" cy="40" r="1.1" />
        <circle cx="36" cy="120" r="1.2" />
        <circle cx="128" cy="92" r="1" />
        <circle cx="150" cy="60" r="1.3" />
      </g>
      <path d="M12 150C50 120 90 100 160 60" fill="none" stroke="#E8CB7F" strokeWidth="0.6" strokeDasharray="1 5" opacity="0.5" />
    </svg>
  );
}

/** Đèn lồng đỏ, dùng cho mẫu Song Hỷ */
export function Lantern(props: P) {
  return (
    <svg viewBox="0 0 40 92" aria-hidden="true" {...props}>
      <path d="M20 0V14" stroke="#E2B95A" strokeWidth="1.2" />
      <rect x="13" y="13" width="14" height="5" rx="1.5" fill="#E2B95A" />
      <ellipse cx="20" cy="38" rx="17" ry="21" fill="#C8262D" />
      <path d="M20 17V59M11 20Q4 38 11 56M29 20Q36 38 29 56" stroke="#E2B95A" strokeWidth="0.9" fill="none" />
      <rect x="13" y="57" width="14" height="5" rx="1.5" fill="#E2B95A" />
      <path d="M17 62V86M20 62V90M23 62V86" stroke="#E2B95A" strokeWidth="1.2" />
    </svg>
  );
}

/** Dấu sáp tròn có chữ cái */
export function WaxSeal({ text, color, ink, ...props }: P & { text: string; color: string; ink: string }) {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true" {...props}>
      <path d="M40 3c6 0 8 4 13 5s10-1 13 4 1 9 4 13 7 6 6 12-5 7-5 12 3 9-1 13-9 2-13 5-5 9-11 10-9-3-14-4-10 2-13-3-1-9-4-13-8-6-7-12 5-7 5-12-3-9 1-13 9-2 13-5 5-9 11-10" fill={color} />
      <circle cx="40" cy="40" r="26" fill="none" stroke={ink} strokeOpacity="0.45" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="22" fill={color} stroke="#000" strokeOpacity="0.12" />
      <path d="M30 24c-5 3-8 8-8 14" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x="40" y="47" textAnchor="middle" fontFamily="var(--f-script), cursive" fontSize="22" fill={ink}>
        {text}
      </text>
    </svg>
  );
}

/** Đường kẻ ngăn giữa các khối, có hoa văn nhỏ ở giữa */
export function Divider(props: P) {
  return (
    <svg viewBox="0 0 160 16" aria-hidden="true" {...props}>
      <path d="M0 8H62M98 8H160" stroke="currentColor" strokeWidth="0.8" />
      <path d="M80 1.5L86.5 8 80 14.5 73.5 8Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="80" cy="8" r="1.8" fill="currentColor" />
      <circle cx="68" cy="8" r="1.2" fill="currentColor" />
      <circle cx="92" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** Trái tim trong vòng tròn, dùng trên bìa */
export function HeartBadge(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 21s-7.5-4.6-9.5-9.2C1 8 3.4 4.5 7 4.5c2 0 3.5 1 5 2.8 1.5-1.8 3-2.8 5-2.8 3.6 0 6 3.5 4.5 7.3C19.5 16.4 12 21 12 21Z" fill="currentColor" />
    </svg>
  );
}

export function IconNote(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function IconPin(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 3 10 14" />
      <path d="M21 3 14 21l-4-7-7-4 18-7Z" />
    </svg>
  );
}

export function IconCalendar(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconCopy(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}

export function IconGift(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 12v9H4v-9" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 21V7" />
      <path d="M12 7c-1.5-3-6-3-6-1s4 1 6 1Zm0 0c1.5-3 6-3 6-1s-4 1-6 1Z" />
    </svg>
  );
}
