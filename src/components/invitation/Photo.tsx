/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";

/** Ảnh có ô giữ chỗ khi chưa tải ảnh lên */
export function Photo({ src, alt, className = "", style, label = "Ảnh" }: { src?: string; alt: string; className?: string; style?: CSSProperties; label?: string }) {
  return (
    <div className={`photo ${className}`} style={style}>
      {src ? <img src={src} alt={alt} loading="lazy" /> : <span className="photo-empty">{label}</span>}
    </div>
  );
}
