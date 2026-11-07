import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Thiệp cưới online",
    short_name: "Thiệp cưới",
    description: "Tạo thiệp cưới online: chọn mẫu, thêm ảnh, gửi link cho khách.",
    lang: "vi",
    start_url: "/",
    display: "standalone",
    background_color: "#F6EFE3",
    theme_color: "#A8894F",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
