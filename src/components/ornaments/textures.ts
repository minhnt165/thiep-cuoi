import type { Theme } from "@/lib/templates";

/**
 * Chất liệu nền vẽ bằng SVG filter (feTurbulence), nhúng dạng data URI.
 * Không cần file ảnh, đổi màu theo theme.
 */
function svgUrl(svg: string): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}")`;
}

function marble(bg: string, vein: string, veinSoft: string): string {
  return svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'>
    <filter id='v' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.004 0.007' numOctaves='5' seed='11' result='n'/>
      <feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.4 0 0 0 -0.2' result='a'/>
      <feComponentTransfer in='a' result='veins'><feFuncA type='table' tableValues='0 0 0 0 0 0 0 0 0 0 0 0 0.15 1 0.15 0 0 0 0 0 0 0 0 0 0 0 0'/></feComponentTransfer>
      <feGaussianBlur in='veins' stdDeviation='0.35' result='vb'/>
      <feFlood flood-color='${vein}' flood-opacity='0.6' result='c'/>
      <feComposite in='c' in2='vb' operator='in'/>
    </filter>
    <filter id='s' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
      <feTurbulence type='fractalNoise' baseFrequency='0.006 0.004' numOctaves='3' seed='4' result='n'/>
      <feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.2 0 0 0 -0.1' result='a'/>
      <feComponentTransfer in='a' result='veins'><feFuncA type='table' tableValues='0 0 0 0 0.5 0.1 0 0 0 0'/></feComponentTransfer>
      <feGaussianBlur in='veins' stdDeviation='10' result='vb'/>
      <feFlood flood-color='${veinSoft}' flood-opacity='0.28' result='c'/>
      <feComposite in='c' in2='vb' operator='in'/>
    </filter>
    <rect width='100%' height='100%' fill='${bg}'/>
    <rect width='100%' height='100%' filter='url(#s)'/>
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

export function textureCss(theme: Theme): string {
  const c = theme.colors;
  switch (theme.texture) {
    case "marble":
      return marble(c.bg, c.gold, "#D8CBB4");
    case "paper":
      return grain(c.bg, 0.9, 0.16);
    case "linen":
      return grain(c.bg, 1.6, 0.12);
    default:
      return "none";
  }
}
