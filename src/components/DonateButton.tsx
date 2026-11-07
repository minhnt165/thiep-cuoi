"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

interface Props {
  qr: string;
  bank: string;
  account: string;
  holder: string;
}

function Cup({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path className="steam s1" d="M24 14c-3-4 3-6 0-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path className="steam s2" d="M32 14c-3-4 3-6 0-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path className="steam s3" d="M40 14c-3-4 3-6 0-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 22h36v12c0 10-8 18-18 18S14 44 14 34V22Z" fill="currentColor" opacity="0.22" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 26h4a6 6 0 0 1 0 12h-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 56h44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Nút nhỏ ở chân trang, bấm mở hộp QR mời cà phê */
export function DonateButton({ qr, bank, account, holder }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* trình duyệt chặn, người dùng tự chép */
    }
  }

  return (
    <>
      <button type="button" className="coffee-btn" onClick={() => setOpen(true)}>
        <Cup className="coffee-ic" />
        Mời tác giả cốc cà phê
      </button>

      {open && (
        <div className="coffee-overlay" onClick={() => setOpen(false)}>
          <div className="coffee-card" role="dialog" aria-modal="true" aria-label="Mời tác giả cốc cà phê" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="coffee-close" onClick={() => setOpen(false)} aria-label="Đóng">×</button>
            <div className="coffee-head">
              <Cup className="coffee-big" />
              <p className="coffee-kicker">Cảm ơn bạn đã ghé</p>
              <h3>Một cốc cà phê cho tác giả</h3>
              <p>Dự án miễn phí, mình tự làm và tự trả tiền máy chủ. Nếu thiệp giúp được bạn, quét mã dưới đây, số tiền tùy tâm.</p>
            </div>
            <div className="coffee-qr">
              <img src={qr} alt={`Mã QR chuyển khoản ${bank}`} width={180} height={180} />
            </div>
            <div className="coffee-acc">
              <span className="coffee-bank">{bank}</span>
              <b>{account}</b>
              {holder && <span className="coffee-holder">{holder}</span>}
            </div>
            <button type="button" className="coffee-copy" onClick={copy}>{copied ? "Đã sao chép ✓" : "Sao chép số tài khoản"}</button>
          </div>
        </div>
      )}
    </>
  );
}
