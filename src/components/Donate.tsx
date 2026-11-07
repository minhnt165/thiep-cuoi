/* eslint-disable @next/next/no-img-element */
import { BANKS, vietQrUrl } from "@/lib/banks";

/**
 * Khối "mời tác giả cốc cà phê" ở cuối trang chủ. Tài khoản lấy từ biến môi
 * trường (DONATE_BANK_CODE, DONATE_ACCOUNT, DONATE_HOLDER, DONATE_NOTE) để
 * không ghi số tài khoản vào mã nguồn. Thiếu biến thì không hiện gì.
 */
export function Donate() {
  const bin = process.env.DONATE_BANK_CODE ?? "";
  const account = process.env.DONATE_ACCOUNT ?? "";
  const holder = process.env.DONATE_HOLDER ?? "";
  const note = process.env.DONATE_NOTE ?? "Ca phe cho tac gia thiep cuoi";
  if (!bin || !account) return null;
  const bank = BANKS.find((b) => b.bin === bin);
  return (
    <section className="donate" aria-label="Ủng hộ tác giả">
      <div className="donate-qr">
        <img src={vietQrUrl(bin, account, holder, note)} alt="Mã QR chuyển khoản ủng hộ tác giả" width={150} height={150} loading="lazy" />
      </div>
      <div className="donate-text">
        <p className="home-kicker">Mời tác giả cốc cà phê ☕</p>
        <h2>Thấy thiệp hữu ích?</h2>
        <p>
          Dự án miễn phí, tự chạy trên Vercel và Supabase. Nếu bạn muốn, một cốc cà phê là đủ để mình tiếp tục làm thêm mẫu mới.
          Quét mã bằng app ngân hàng, số tiền tùy tâm.
        </p>
        <p className="donate-acc">
          {bank?.name ?? "Ngân hàng"} · <b>{account}</b>{holder ? ` · ${holder}` : ""}
        </p>
      </div>
    </section>
  );
}
