"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./confirm-dialog.css";

/**
 * Hộp xác nhận dùng chung (thay window.confirm): gọi `await confirmDialog({...})`
 * ở bất kỳ đâu, trả true nếu người dùng đồng ý. Dùng <dialog> gốc của trình duyệt
 * nên có sẵn chặn bấm phía sau, giữ focus trong hộp và Esc để hủy.
 * Hộp hành động nguy hiểm (xóa) đặt focus sẵn vào nút Hủy để lỡ tay Enter không xóa.
 */

export interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

function Dialog({ title, message, confirmLabel = "Đồng ý", cancelLabel = "Hủy", danger = false, onClose }: ConfirmOptions & { onClose: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const done = useRef(false);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  function close(ok: boolean) {
    if (done.current) return;
    done.current = true;
    ref.current?.close();
    onClose(ok);
  }

  return (
    <dialog
      ref={ref}
      className={`cf ${danger ? "danger" : ""}`}
      aria-labelledby="cf-title"
      onCancel={(e) => {
        e.preventDefault();
        close(false);
      }}
      // Bấm ra vùng tối bên ngoài thì hủy
      onClick={(e) => {
        if (e.target === ref.current) close(false);
      }}
    >
      <div className="cf-body">
        {danger && (
          <span className="cf-ic" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V4.5h4V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6" /></svg>
          </span>
        )}
        <h2 id="cf-title">{title}</h2>
        {message && <div className="cf-msg">{message}</div>}
      </div>
      <div className="cf-acts">
        <button type="button" className="cf-btn" onClick={() => close(false)} autoFocus={danger}>{cancelLabel}</button>
        <button type="button" className={`cf-btn primary ${danger ? "danger" : ""}`} onClick={() => close(true)} autoFocus={!danger}>{confirmLabel}</button>
      </div>
    </dialog>
  );
}

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  if (typeof document === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    root.render(
      <Dialog
        {...opts}
        onClose={(ok) => {
          resolve(ok);
          // Đợi hiệu ứng đóng xong rồi mới gỡ khỏi trang
          setTimeout(() => {
            root.unmount();
            host.remove();
          }, 160);
        }}
      />,
    );
  });
}

/** Xác nhận xóa: "Xóa việc “Đăng ký kết hôn”?" kèm một dòng giải thích hậu quả */
export function confirmDelete(what: string, detail?: ReactNode, confirmLabel = "Xóa"): Promise<boolean> {
  return confirmDialog({ title: `${what}?`, message: detail, confirmLabel, danger: true });
}

/** Tên ngắn gọn trong ngoặc kép để ghi vào câu hỏi xác nhận */
export function quote(text: string, max = 48): string {
  const t = text.trim().replace(/\s+/g, " ");
  return `“${t.length > max ? t.slice(0, max - 1) + "…" : t}”`;
}
