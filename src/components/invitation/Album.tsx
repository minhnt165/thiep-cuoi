"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { PublicInvitation } from "@/lib/schema";
import { Divider } from "@/components/ornaments";
import { Photo } from "./Photo";
import { Modal } from "./Modal";

const AUTOPLAY_MS = 4200;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];

function Arrow({ dir }: { dir: "l" | "r" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === "l" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}

/**
 * Vuốt ngang. Không dùng setPointerCapture: nó chuyển hướng cả sự kiện click
 * về container nên nút mũi tên và ảnh không bấm được.
 */
function useSwipe(onSwipe: (dir: 1 | -1) => void) {
  const start = useRef<{ x: number; y: number; w: number } | null>(null);
  const moved = useRef(false);
  /** px: độ lệch tay kéo · frac: độ lệch so với chiều rộng phần tử */
  const [drag, setDrag] = useState({ px: 0, frac: 0 });
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, w: (e.currentTarget as HTMLElement).clientWidth || 320 };
    moved.current = false;
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
      moved.current = true;
      setDrag({ px: dx, frac: dx / start.current.w });
    }
  };
  const end = () => {
    if (start.current && Math.abs(drag.px) > 40) onSwipe(drag.px < 0 ? 1 : -1);
    start.current = null;
    setDrag({ px: 0, frac: 0 });
  };
  /** true nếu vừa kéo xong, để bỏ qua click ngay sau đó */
  const justDragged = () => moved.current;
  return { drag, justDragged, handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end, onPointerLeave: end } };
}

/**
 * Ảnh trong thẻ album. Ảnh dọc phủ kín thẻ; ảnh ngang (nhận ra khi tải xong)
 * hiện trọn, phía sau là chính ảnh đó làm mờ để không bị cắt hai bên.
 */
function CardPhoto({ src, index }: { src: string; index: number }) {
  const [wide, setWide] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const check = (img: HTMLImageElement | null) => {
    if (img && img.naturalWidth) setWide(img.naturalWidth > img.naturalHeight * 1.05);
  };
  // Ảnh có thể đã tải xong trước khi React gắn onLoad (SSR + cache) nên kiểm tra thêm lúc gắn
  useEffect(() => {
    if (ref.current?.complete) check(ref.current);
  }, [src]);
  if (!src) return <Photo src="" alt="" label={`Ảnh ${index + 1}`} />;
  return (
    <div className={`photo ${wide ? "is-wide" : ""}`}>
      {wide && <img className="photo-blur" src={src} alt="" aria-hidden="true" draggable={false} />}
      <img ref={ref} src={src} alt={`Ảnh cưới ${index + 1}`} loading="lazy" draggable={false} onLoad={(e) => check(e.currentTarget)} />
    </div>
  );
}

/** Khoảng cách vòng tròn ngắn nhất từ ảnh i tới ảnh đang xem */
function circular(i: number, idx: number, n: number): number {
  let d = i - idx;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}

export function Album({ data }: { data: PublicInvitation }) {
  const photos = data.photos.album.length ? data.photos.album : ["", "", "", "", ""];
  const n = photos.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const go = useCallback((d: 1 | -1) => setIdx((i) => (i + d + n) % n), [n]);
  const swipe = useSwipe(go);
  const lbSwipe = useSwipe((d) => setLightbox((i) => (i === null ? null : (i + d + n) % n)));

  useEffect(() => {
    if (paused || lightbox !== null || n < 2) return;
    const id = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, lightbox, n, go, idx]);

  useEffect(() => {
    if (lightbox === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i === null ? null : (i + 1) % n));
      if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? null : (i - 1 + n) % n));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lightbox, n]);

  const dragFrac = swipe.drag.frac;

  function cardStyle(i: number): CSSProperties {
    const off = circular(i, idx, n) + (n > 1 ? -dragFrac : 0);
    const a = Math.abs(off);
    const hidden = a > 1.6;
    return {
      transform: `translateX(${off * 72}%) translateZ(${-a * 140}px) rotateY(${-off * 18}deg) scale(${1 - a * 0.1})`,
      opacity: hidden ? 0 : 1 - a * 0.35,
      zIndex: 10 - Math.round(a * 4),
      transition: swipe.drag.px ? "none" : undefined,
      pointerEvents: a < 0.5 ? "auto" : "none",
    };
  }

  const openLightbox = (i: number) => {
    if (swipe.justDragged()) return;
    setLightbox(i);
  };

  return (
    <section className="sec reveal" id="s-album">
      <h2 className="sec-title">Album ảnh</h2>
      <Divider className="divider" />

      <div
        className="stage"
        onPointerEnter={() => setPaused(true)}
        {...swipe.handlers}
        onPointerLeave={() => {
          setPaused(false);
          swipe.handlers.onPointerLeave();
        }}
      >
        {photos.map((p, i) => (
          <button type="button" className={`card ${i === idx ? "is-active" : ""}`} key={i} style={cardStyle(i)} onClick={() => openLightbox(i)} aria-label={`Xem ảnh ${i + 1} toàn màn hình`} tabIndex={i === idx ? 0 : -1} aria-hidden={i !== idx}>
            <CardPhoto src={p} index={i} />
            <span className="card-num">{ROMAN[i] ?? i + 1}</span>
          </button>
        ))}
        {n > 1 && (
          <>
            <button type="button" className="stage-btn stage-l" onClick={() => go(-1)} aria-label="Ảnh trước"><Arrow dir="l" /></button>
            <button type="button" className="stage-btn stage-r" onClick={() => go(1)} aria-label="Ảnh sau"><Arrow dir="r" /></button>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="stage-foot">
          <span className="script stage-cap">Khoảnh khắc</span>
          <span className="stage-count">{String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
          <span className="stage-bar" aria-hidden="true">
            <i key={idx} style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: paused || lightbox !== null ? "paused" : "running" }} />
          </span>
        </div>
      )}

      {lightbox !== null && (
        <Modal className="lightbox" label="Xem ảnh" onClose={() => setLightbox(null)} overlayProps={lbSwipe.handlers}>
          <button type="button" className="lb-close" onClick={() => setLightbox(null)} aria-label="Đóng">×</button>
          <div className="lb-stage" style={{ transform: `translateX(${lbSwipe.drag.px}px)`, transition: lbSwipe.drag.px ? "none" : undefined }}>
            {photos[lightbox] ? <img src={photos[lightbox]} alt={`Ảnh cưới ${lightbox + 1}`} draggable={false} /> : <Photo src="" alt="" label={`Ảnh ${lightbox + 1}`} className="lb-empty" />}
          </div>
          {n > 1 && (
            <>
              <button type="button" className="stage-btn stage-l" onClick={() => setLightbox((lightbox - 1 + n) % n)} aria-label="Ảnh trước"><Arrow dir="l" /></button>
              <button type="button" className="stage-btn stage-r" onClick={() => setLightbox((lightbox + 1) % n)} aria-label="Ảnh sau"><Arrow dir="r" /></button>
            </>
          )}
          <span className="lb-count">{lightbox + 1} / {n}</span>
        </Modal>
      )}
    </section>
  );
}
