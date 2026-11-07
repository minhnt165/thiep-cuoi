import type { TemplateId } from "@/lib/schema";

/**
 * Một mẫu (template) = bộ token màu, chữ, chất liệu nền, họa tiết và kiểu bìa.
 * Các phần của thiệp (section) dùng chung, chỉ đọc CSS variable.
 */
export interface Theme {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  colors: {
    /** nền trang */ bg: string;
    /** nền phụ, dải xen kẽ */ bg2: string;
    /** chữ chính */ ink: string;
    /** chữ phụ */ muted: string;
    /** màu nhấn */ accent: string;
    /** chữ đặt trên màu nhấn */ accentInk: string;
    /** vàng kim (chữ Hỷ, viền) */ gold: string;
    /** viền */ line: string;
    /** khối nổi (card) */ panel: string;
    /** chữ trong khối */ panelInk: string;
    /** chữ phụ trong khối */ panelMuted: string;
    /** nền ngoài khung điện thoại trên desktop */ outer: string;
    /** ô thay thế khi chưa có ảnh */ placeholder: string;
  };
  fonts: { display: string; script: string; body: string };
  radius: string;
  texture: "marble" | "paper" | "linen" | "none";
  ornament: "goldLeaf" | "burgundyRose" | "songHy" | "whiteBlossom";
  cover: "card" | "envelope" | "band" | "polaroid";
  /** hiệu ứng rơi */ fall: "sparkle" | "petal" | "none";
}

export const THEMES: Record<TemplateId, Theme> = {
  "marble-gold": {
    id: "marble-gold",
    name: "Cẩm thạch vàng",
    tagline: "Sang trọng · tiệc nhà hàng",
    description: "Nền cẩm thạch trắng vân vàng, lá vàng kim ở góc, chữ nâu đồng. Nhẹ, sáng và lịch sự.",
    colors: {
      bg: "#FBF8F2", bg2: "#F4EEE3", ink: "#4A3A28", muted: "#8A7B66", accent: "#A8894F", accentInk: "#FFF9EC",
      gold: "#C9A961", line: "#E2D6C2", panel: "#FFFDF9", panelInk: "#4A3A28", panelMuted: "#8A7B66",
      outer: "linear-gradient(160deg,#D9BE8A,#B9975C 60%,#A5844A)", placeholder: "linear-gradient(135deg,#E9DCC3,#C9B48E)",
    },
    fonts: { display: "var(--font-viaoda)", script: "var(--font-beau)", body: "var(--font-garamond)" },
    radius: "14px",
    texture: "marble",
    ornament: "goldLeaf",
    cover: "card",
    fall: "sparkle",
  },
  "burgundy-envelope": {
    id: "burgundy-envelope",
    name: "Đỏ rượu tối giản",
    tagline: "Cổ điển · ấm áp",
    description: "Giấy kem, khối đỏ rượu chữ kem, phong bì có dấu sáp và hoa hồng đỏ. Đậm và sang.",
    colors: {
      bg: "#F4ECE2", bg2: "#EDE2D4", ink: "#3B1C20", muted: "#8C6F6B", accent: "#5E1420", accentInk: "#F6E7D8",
      gold: "#C9A24A", line: "#DCCBB8", panel: "#5E1420", panelInk: "#F6E7D8", panelMuted: "#D9B8B3",
      outer: "linear-gradient(160deg,#7A2030,#4E0F1A 60%,#3A0A12)", placeholder: "linear-gradient(135deg,#E6CDBF,#A86B6B)",
    },
    fonts: { display: "var(--font-playfair)", script: "var(--font-great-vibes)", body: "var(--font-garamond)" },
    radius: "14px",
    texture: "paper",
    ornament: "burgundyRose",
    cover: "envelope",
    fall: "sparkle",
  },
  "song-hy": {
    id: "song-hy",
    name: "Song Hỷ",
    tagline: "Truyền thống · xanh rêu và vàng",
    description: "Dải xanh rêu bo cong, chữ Hỷ vàng, đèn lồng, ảnh khung vòm. Có ngày âm lịch nổi bật.",
    colors: {
      bg: "#F6F1E6", bg2: "#EEE6D4", ink: "#1E2A24", muted: "#6F7568", accent: "#1F4A3A", accentInk: "#F6EBD0",
      gold: "#D9AE55", line: "#D9CFB8", panel: "#1F4A3A", panelInk: "#F6EBD0", panelMuted: "#BFCDB8",
      outer: "linear-gradient(160deg,#2E5C49,#1A3D30 60%,#12291F)", placeholder: "linear-gradient(135deg,#E9DFC2,#7F9A7A)",
    },
    fonts: { display: "var(--font-playfair)", script: "var(--font-playfair)", body: "var(--font-noto-serif)" },
    radius: "4px",
    texture: "linen",
    ornament: "songHy",
    cover: "band",
    fall: "sparkle",
  },
  "white-blossom": {
    id: "white-blossom",
    name: "Hoa trắng",
    tagline: "Nhẹ nhàng · tiệc ngoài trời",
    description: "Kem sáng, chùm hoa trắng lá xanh, ảnh polaroid dán băng keo, chữ ký mềm. Cánh hoa rơi.",
    colors: {
      bg: "#FAF8F2", bg2: "#F1EFE5", ink: "#2F3A31", muted: "#7D867A", accent: "#3F5B45", accentInk: "#FFFFFF",
      gold: "#D9C27A", line: "#DDE0D2", panel: "#FFFFFF", panelInk: "#2F3A31", panelMuted: "#7D867A",
      outer: "linear-gradient(160deg,#B9C7AA,#8FA889 60%,#6E8A6F)", placeholder: "linear-gradient(135deg,#F0E6D2,#B9CBB0)",
    },
    fonts: { display: "var(--font-lora)", script: "var(--font-alex-brush)", body: "var(--font-lora)" },
    radius: "18px",
    texture: "none",
    ornament: "whiteBlossom",
    cover: "polaroid",
    fall: "petal",
  },
};

export const THEME_LIST = Object.values(THEMES);

/** Chuyển theme thành CSS variables đặt lên phần tử gốc của thiệp */
export function themeVars(theme: Theme, accentOverride?: string): Record<string, string> {
  const c = theme.colors;
  const accent = accentOverride || c.accent;
  const panel = c.panel === c.accent ? accent : c.panel;
  return {
    "--bg": c.bg, "--bg2": c.bg2, "--ink": c.ink, "--muted": c.muted, "--accent": accent, "--accent-ink": c.accentInk,
    "--gold": c.gold, "--line": c.line, "--panel": panel, "--panel-ink": c.panelInk, "--panel-muted": c.panelMuted,
    "--outer": c.outer, "--placeholder": c.placeholder, "--radius": theme.radius,
    "--f-display": theme.fonts.display, "--f-script": theme.fonts.script, "--f-body": theme.fonts.body,
  };
}
