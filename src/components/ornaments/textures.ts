import type { Theme } from "@/lib/templates";

/**
 * Chất liệu nền vẽ bằng SVG filter (feTurbulence), nhúng dạng data URI.
 * Không cần file ảnh, đổi màu theo theme.
 */
function svgUrl(svg: string): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}")`;
}

/** Bảng alpha chỉ nhô lên quanh một mức nhiễu: mức đó thành đường vân, càng nhiều ô thì vân càng mảnh */
function ridge(cells: number, at: number): string {
  return Array.from({ length: cells }, (_, i) => (i === at ? 1 : Math.abs(i - at) === 1 ? 0.2 : 0)).join(" ");
}

function marble(bg: string, vein: string, veinSoft: string): string {
  return svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'>
    <filter id='v' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.004 0.007' numOctaves='5' seed='11' stitchTiles='stitch' result='n'/>
      <feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.4 0 0 0 -0.2' result='a'/>
      <feComponentTransfer in='a' result='veins'><feFuncA type='table' tableValues='${ridge(71, 35)}'/></feComponentTransfer>
      <feGaussianBlur in='veins' stdDeviation='0.3' result='vb'/>
      <feFlood flood-color='${vein}' flood-opacity='0.75' result='c'/>
      <feComposite in='c' in2='vb' operator='in'/>
    </filter>
    <filter id='f' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.008 0.005' numOctaves='4' seed='23' stitchTiles='stitch' result='n'/>
      <feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.4 0 0 0 -0.2' result='a'/>
      <feComponentTransfer in='a' result='veins'><feFuncA type='table' tableValues='${ridge(91, 41)}'/></feComponentTransfer>
      <feFlood flood-color='#A89A84' flood-opacity='0.28' result='c'/>
      <feComposite in='c' in2='veins' operator='in'/>
    </filter>
    <filter id='s' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.006 0.004' numOctaves='3' seed='4' stitchTiles='stitch' result='n'/>
      <feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.2 0 0 0 -0.1' result='a'/>
      <feComponentTransfer in='a' result='veins'><feFuncA type='table' tableValues='0 0 0 0 0.5 0.1 0 0 0 0'/></feComponentTransfer>
      <feGaussianBlur in='veins' stdDeviation='10' result='vb'/>
      <feFlood flood-color='${veinSoft}' flood-opacity='0.28' result='c'/>
      <feComposite in='c' in2='vb' operator='in'/>
    </filter>
    <rect width='100%' height='100%' fill='${bg}'/>
    <rect width='100%' height='100%' filter='url(#s)'/>
    <rect width='100%' height='100%' filter='url(#f)'/>
    <rect width='100%' height='100%' filter='url(#v)'/>
  </svg>`);
}

function grain(bg: string, freq: number, opacity: number): string {
  return svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
    <filter id='g' x='0' y='0' width='100%' height='100%'>
      <feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='2' seed='2' stitchTiles='stitch'/>
      <feColorMatrix type='saturate' values='0'/>
      <feComponentTransfer><feFuncA type='linear' slope='${opacity}'/></feComponentTransfer>
    </filter>
    <rect width='100%' height='100%' fill='${bg}'/>
    <rect width='100%' height='100%' filter='url(#g)'/>
  </svg>`);
}

/** Sao nhỏ rải thưa trên nền tối; vị trí cố định theo công thức để mỗi lần render giống nhau */
function stars(bg: string, color: string): string {
  const dots = Array.from({ length: 70 }, (_, i) => {
    const x = (i * 149) % 900;
    const y = (i * 263 + 37) % 900;
    const r = 0.5 + ((i * 7) % 5) * 0.28;
    const o = 0.25 + ((i * 11) % 6) * 0.1;
    return `<circle cx='${x}' cy='${y}' r='${r.toFixed(2)}' fill='${color}' opacity='${o.toFixed(2)}'/>`;
  }).join("");
  const sparks = [120, 340, 610, 780].map((x, i) => {
    const y = (x * 1.7 + i * 90) % 900;
    return `<path d='M${x} ${y - 7}L${x + 1.6} ${y - 1.6} ${x + 7} ${y} ${x + 1.6} ${y + 1.6} ${x} ${y + 7} ${x - 1.6} ${y + 1.6} ${x - 7} ${y} ${x - 1.6} ${y - 1.6}Z' fill='${color}' opacity='0.8'/>`;
  }).join("");
  return svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'>
    <rect width='100%' height='100%' fill='${bg}'/>
    ${dots}${sparks}
  </svg>`);
}

export function textureCss(theme: Theme): string {
  const c = theme.colors;
  switch (theme.texture) {
    case "marble":
      return marble(c.bg, c.gold, "#D8CBB4");
    case "paper":
      return grain(c.bg, 0.9, 0.16);
    case "linen":
      return grain(c.bg, 1.6, 0.12);
    case "stars":
      return stars(c.bg, c.gold);
    default:
      return "none";
  }
}
