/* eslint-disable @next/next/no-img-element */
import { BANKS, vietQrUrl } from "@/lib/banks";

/**
 * "Mời tác giả cốc cà phê" ở cuối trang chủ: mặc định chỉ là một dòng nhỏ,
 * bấm mới mở ra mã VietQR và số tài khoản. Tài khoản lấy từ biến môi trường
 * (DONATE_BANK_CODE, DONATE_ACCOUNT, DONATE_HOLDER, DONATE_NOTE); thiếu thì ẩn.
 */
export function Donate() {
  const bin = process.env.DONATE_BANK_CODE ?? "";
  const account = process.env.DONATE_ACCOUNT ?? "";
  const holder = process.env.DONATE_HOLDER ?? "";
  const note = process.env.DONATE_NOTE ?? "Ca phe cho tac gia thiep cuoi";
  if (!bin || !account) return null;
  const bank = BANKS.find((b) => b.bin === bin);
  return (
    <details className="donate">
      <summary>☕ Mời tác giả cốc cà phê</summary>
      <div className="donate-body">
        <div className="donate-qr">
          <img src={vietQrUrl(bin, account, holder, note)} alt="Mã QR chuyển khoản ủng hộ tác giả" width={140} height={140} loading="lazy" />
        </div>
        <div className="donate-text">
          <p>Dự án miễn phí. Nếu thấy hữu ích, quét mã bằng app ngân hàng, số tiền tùy tâm. Cảm ơn bạn.</p>
          <p className="donate-acc">
            {bank?.name ?? "Ngân hàng"} · <b>{account}</b>{holder ? ` · ${holder}` : ""}
          </p>
        </div>
      </div>
    </details>
  );
}
