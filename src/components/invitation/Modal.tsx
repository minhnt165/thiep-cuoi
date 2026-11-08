"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  onClose: () => void;
  label: string;
  className?: string;
  children: ReactNode;
  /** Thêm thuộc tính cho lớp phủ (vd. handler vuốt của lightbox) */
  overlayProps?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * Popup trong thiệp. Gắn thẳng vào `.inv-root` (portal) để:
 * - nằm trên mọi phần của thiệp (mỗi section có z-index riêng, popup đặt bên trong sẽ bị phần sau đè lên),
 * - vẫn dùng được biến màu của mẫu (đặt trên `.inv-root`).
 * Trang thật: phủ cố định cả màn hình và khóa cuộn. Khung xem trước (embedded): phủ đúng
 * vùng đang nhìn thấy của khung điện thoại và khóa cuộn khung đó.
 */
export function Modal({ onClose, label, className = "", children, overlayProps }: Props) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [pos, setPos] = useState<CSSProperties>({});
  /** class của mẫu (t-xxx, is-dark) lấy từ khối .inv để CSS riêng của mẫu áp được vào popup */
  const [themeCls, setThemeCls] = useState("");

  useLayoutEffect(() => {
    const root = anchor.current?.closest<HTMLElement>(".inv-root");
    if (!root) return;
    const inv = root.querySelector<HTMLElement>(".inv");
    setThemeCls(inv ? [...inv.classList].filter((c) => c.startsWith("t-") || c === "is-dark").join(" ") : "");
    const embedded = root.classList.contains("is-embedded");
    const scroller = embedded ? root : document.documentElement;
    const prev = scroller.style.overflow;
    scroller.style.overflow = "hidden";
    setPos(embedded ? { position: "absolute", top: root.scrollTop, left: 0, right: 0, height: root.clientHeight } : { position: "fixed", inset: 0 });
    setHost(root);
    return () => {
      scroller.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <>
      <span ref={anchor} hidden />
      {host &&
        createPortal(
          // chỉ đóng khi bấm đúng lớp nền, không phải khi bấm vào nội dung bên trong
          <div {...overlayProps} className={`modal ${themeCls} ${className}`} style={pos} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.target === e.currentTarget && onClose()}>
            {children}
          </div>,
          host,
        )}
    </>
  );
}
