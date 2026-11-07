import type { Metadata, Viewport } from "next";
import {
  Alex_Brush,
  Be_Vietnam_Pro,
  Beau_Rivage,
  Cormorant_Garamond,
  EB_Garamond,
  Great_Vibes,
  Lora,
  Noto_Serif,
  Playfair_Display,
  Viaoda_Libre,
} from "next/font/google";
import "./globals.css";

// Mọi font đều có subset "vietnamese" để dấu tiếng Việt hiện đúng.
const ui = Be_Vietnam_Pro({ variable: "--font-ui", subsets: ["vietnamese", "latin"], weight: ["400", "500", "600"], display: "swap" });
const viaoda = Viaoda_Libre({ variable: "--font-viaoda", subsets: ["vietnamese", "latin"], weight: "400", display: "swap" });
const beau = Beau_Rivage({ variable: "--font-beau", subsets: ["vietnamese", "latin"], weight: "400", display: "swap" });
const garamond = EB_Garamond({ variable: "--font-garamond", subsets: ["vietnamese", "latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["vietnamese", "latin"], weight: ["400", "600"], style: ["normal", "italic"], display: "swap" });
const greatVibes = Great_Vibes({ variable: "--font-great-vibes", subsets: ["vietnamese", "latin"], weight: "400", display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["vietnamese", "latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], display: "swap" });
const alexBrush = Alex_Brush({ variable: "--font-alex-brush", subsets: ["vietnamese", "latin"], weight: "400", display: "swap" });
const lora = Lora({ variable: "--font-lora", subsets: ["vietnamese", "latin"], weight: ["400", "500"], style: ["normal", "italic"], display: "swap" });
const notoSerif = Noto_Serif({ variable: "--font-noto-serif", subsets: ["vietnamese", "latin"], weight: ["400", "600"], style: ["normal", "italic"], display: "swap" });

const fontVars = [ui, viaoda, beau, garamond, playfair, greatVibes, cormorant, alexBrush, lora, notoSerif].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  title: { default: "Thiệp cưới online", template: "%s · Thiệp cưới online" },
  description: "Tạo thiệp cưới online: chọn mẫu, thêm ảnh, gửi link cho khách.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FBF8F2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
