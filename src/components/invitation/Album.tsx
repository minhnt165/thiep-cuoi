"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import type { PublicInvitation } from "@/lib/schema";
import { Divider } from "@/components/ornaments";
import { Photo } from "./Photo";

const AUTOPLAY_MS = 3800;

function Arrow({ dir }: { dir: "l" | "r" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === "l" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}

/** Theo dõi vuốt ngang: trả về handler pointer và độ lệch đang kéo */
function useSwipe(onSwipe: (dir: 1 | -1) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState(0);
  const onDown = (e: PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (Math.abs(dx) > Math.abs(dy)) setDrag(dx);
  };
  const onUp = () => {
    if (start.current && Math.abs(drag) > 40) onSwipe(drag < 0 ? 1 : -1);
    start.current = null;
    setDrag(0);
  };
  return { drag, handlers: { onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp } };
}

export function Album({ data }: { data: PublicInvitation }) {
  const photos = data.photos.album.length ? data.photos.album : ["", "", "", ""];
  const n = photos.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const go = useCallback((d: 1 | -1) => setIdx((i) => (i + d + n) % n), [n]);
  const swipe = useSwipe(go);
  const lbSwipe = useSwipe((d) => setLightbox((i) => (i === null ? null : (i + d + n) % n)));

  // Tự chạy, dừng khi đang chạm/kéo hoặc đang xem toàn màn hình
  useEffect(() => {
    if (paused || lightbox !== null || n < 2) return;
    const id = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, lightbox, n, go]);

  // Cuộn dải ảnh nhỏ theo ảnh đang xem. Chỉ cuộn chính dải ảnh,
  // không dùng scrollIntoView vì nó kéo cả trang (và bìa) đi.
  useEffect(() => {
    const strip = stripRef.current;
    const el = strip?.children[idx] as HTMLElement | undefined;
    if (!strip || !el) return;
    const left = el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2;
    strip.scrollTo({ left, behavior: "smooth" });
  }, [idx]);

  // Phím mũi tên / Esc khi xem toàn màn hình
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

  return (
    <section className="sec reveal" id="s-album">
      <h2 className="sec-title">Album ảnh</h2>
      <Divider className="divider" />

      <div
        className="slider"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        {...swipe.handlers}
      >
        <div className="slider-track" style={{ transform: `translateX(calc(${-idx * 100}% + ${swipe.drag}px))`, transition: swipe.drag ? "none" : undefined }}>
          {photos.map((p, i) => (
            <button type="button" className="slide" key={i} onClick={() => !swipe.drag && setLightbox(i)} aria-label={`Xem ảnh ${i + 1} toàn màn hình`} tabIndex={i === idx ? 0 : -1}>
              <Photo src={p} alt={`Ảnh cưới ${i + 1}`} label={`Ảnh ${i + 1}`} className={i === idx ? "is-active" : ""} />
            </button>
          ))}
        </div>
        {n > 1 && (
          <>
            <button type="button" className="slider-btn slider-l" onClick={() => go(-1)} aria-label="Ảnh trước"><Arrow dir="l" /></button>
            <button type="button" className="slider-btn slider-r" onClick={() => go(1)} aria-label="Ảnh sau"><Arrow dir="r" /></button>
            <span className="slider-count">{idx + 1} / {n}</span>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="strip" ref={stripRef}>
          {photos.map((p, i) => (
            <button type="button" key={i} className={`strip-i ${i === idx ? "on" : ""}`} onClick={() => setIdx(i)} aria-label={`Chọn ảnh ${i + 1}`} aria-current={i === idx}>
              <Photo src={p} alt="" label="" />
            </button>
          ))}
        </div>
      )}

      {lightbox !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Xem ảnh" {...lbSwipe.handlers}>
          <button type="button" className="lb-close" onClick={() => setLightbox(null)} aria-label="Đóng">×</button>
          <div className="lb-stage" style={{ transform: `translateX(${lbSwipe.drag}px)`, transition: lbSwipe.drag ? "none" : undefined }}>
            {photos[lightbox] ? <img src={photos[lightbox]} alt={`Ảnh cưới ${lightbox + 1}`} /> : <Photo src="" alt="" label={`Ảnh ${lightbox + 1}`} className="lb-empty" />}
          </div>
          {n > 1 && (
            <>
              <button type="button" className="slider-btn slider-l" onClick={() => setLightbox((lightbox - 1 + n) % n)} aria-label="Ảnh trước"><Arrow dir="l" /></button>
              <button type="button" className="slider-btn slider-r" onClick={() => setLightbox((lightbox + 1) % n)} aria-label="Ảnh sau"><Arrow dir="r" /></button>
            </>
          )}
          <span className="slider-count">{lightbox + 1} / {n}</span>
        </div>
      )}
    </section>
  );
}
