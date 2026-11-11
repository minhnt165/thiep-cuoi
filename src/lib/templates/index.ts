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
  texture: "marble" | "paper" | "linen" | "stars" | "none";
  ornament: "goldLeaf" | "burgundyRose" | "songHy" | "whiteBlossom" | "eucalyptus" | "peony" | "stars" | "none";
  cover: "card" | "envelope" | "band" | "polaroid" | "arch" | "wreath" | "gate";
  /** màn đầu sau khi mở: mặc định hai ảnh + tên; "cinema" là ảnh bìa tràn màn hình, tên phủ trên ảnh */
  hero?: "cinema";
  /** hiệu ứng rơi */ fall: "sparkle" | "petal" | "none";
  /** nền tối: form, lưu bút, hộp quà đổi sang nền mờ thay vì trắng */
  dark?: boolean;
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
    cover: "gate",
    hero: "cinema",
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
    hero: "cinema",
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
    cover: "gate",
    hero: "cinema",
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
    hero: "cinema",
    fall: "petal",
  },
  "sage-arch": {
    id: "sage-arch",
    name: "Xanh sage vòm",
    tagline: "Hiện đại · ảnh khung vòm",
    description: "Kem nhạt và xanh sage dịu, ảnh cưới khung vòm lớn ngay trên bìa, cành bạch đàn ở góc. Gọn và mát mắt.",
    colors: {
      bg: "#F7F5EF", bg2: "#EEEBE2", ink: "#2E3A33", muted: "#76827A", accent: "#6B7F6A", accentInk: "#FFFFFF",
      gold: "#C8B27A", line: "#DAD9CC", panel: "#6B7F6A", panelInk: "#F7F5EF", panelMuted: "#D6DED3",
      outer: "linear-gradient(160deg,#AEBBA6,#7F9280 60%,#5F7360)", placeholder: "linear-gradient(135deg,#E9E4D2,#AFBFA8)",
    },
    fonts: { display: "var(--font-cormorant)", script: "var(--font-alex-brush)", body: "var(--font-lora)" },
    radius: "20px",
    texture: "none",
    ornament: "eucalyptus",
    cover: "arch",
    hero: "cinema",
    fall: "none",
  },
  "navy-gold": {
    id: "navy-gold",
    name: "Xanh đêm sao",
    tagline: "Dạ tiệc · navy và vàng kim",
    description: "Nền xanh đêm thẫm, chữ vàng kim, sao nhỏ lấp lánh khắp nền. Hợp tiệc tối ở khách sạn, nhà hàng.",
    colors: {
      bg: "#101C2E", bg2: "#15243A", ink: "#F1E8D2", muted: "#A9B0BD", accent: "#D4B46A", accentInk: "#101C2E",
      gold: "#D4B46A", line: "#2B3A52", panel: "#17263D", panelInk: "#F1E8D2", panelMuted: "#A9B0BD",
      outer: "linear-gradient(160deg,#1E3350,#0E1A2B 60%,#080F1B)", placeholder: "linear-gradient(135deg,#243650,#3C5277)",
    },
    fonts: { display: "var(--font-playfair)", script: "var(--font-great-vibes)", body: "var(--font-garamond)" },
    radius: "14px",
    texture: "stars",
    ornament: "stars",
    cover: "gate",
    hero: "cinema",
    fall: "sparkle",
    dark: true,
  },
  "blush-rose": {
    id: "blush-rose",
    name: "Hồng phấn",
    tagline: "Lãng mạn · hoa mẫu đơn",
    description: "Hồng phấn nhẹ, hoa mẫu đơn vẽ tay, ảnh tròn trên bìa như vòng hoa, cánh hoa hồng rơi.",
    colors: {
      bg: "#FBF4F2", bg2: "#F6E9E6", ink: "#4A3238", muted: "#9A7B82", accent: "#B8606F", accentInk: "#FFF7F5",
      gold: "#D3A96A", line: "#EBD7D5", panel: "#FFFFFF", panelInk: "#4A3238", panelMuted: "#9A7B82",
      outer: "linear-gradient(160deg,#E8B9BF,#C98893 60%,#A96672)", placeholder: "linear-gradient(135deg,#F6E1DF,#D9A7B0)",
    },
    fonts: { display: "var(--font-playfair)", script: "var(--font-beau)", body: "var(--font-garamond)" },
    radius: "18px",
    texture: "paper",
    ornament: "peony",
    cover: "wreath",
    hero: "cinema",
    fall: "petal",
  },
  "mono-minimal": {
    id: "mono-minimal",
    name: "Tối giản đen trắng",
    tagline: "Hiện đại · chữ là chính",
    description: "Trắng, đen và một đường kẻ mảnh. Không hoa văn, chữ serif lớn, chữ thường sans. Cho cặp đôi thích gọn.",
    colors: {
      bg: "#FFFFFF", bg2: "#F5F5F3", ink: "#151515", muted: "#7A7A76", accent: "#151515", accentInk: "#FFFFFF",
      gold: "#9A9A94", line: "#E2E2DE", panel: "#FFFFFF", panelInk: "#151515", panelMuted: "#7A7A76",
      outer: "linear-gradient(160deg,#2A2A2A,#141414 60%,#0A0A0A)", placeholder: "linear-gradient(135deg,#EDEDEA,#C9C9C4)",
    },
    fonts: { display: "var(--font-cormorant)", script: "var(--font-cormorant)", body: "var(--font-ui)" },
    radius: "0px",
    texture: "none",
    ornament: "none",
    cover: "gate",
    hero: "cinema",
    fall: "none",
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
