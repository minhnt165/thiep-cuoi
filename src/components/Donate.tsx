import { BANKS, vietQrUrl } from "@/lib/banks";
import { DonateButton } from "./DonateButton";

/**
 * "Mời tác giả cốc cà phê" ở chân trang chủ. Tài khoản lấy từ biến môi trường
 * (DONATE_BANK_CODE, DONATE_ACCOUNT, DONATE_HOLDER, DONATE_NOTE); thiếu thì ẩn.
 * Chỉ đọc env ở server rồi truyền xuống nút (client) để mở hộp QR.
 */
export function Donate() {
  const bin = process.env.DONATE_BANK_CODE ?? "";
  const account = process.env.DONATE_ACCOUNT ?? "";
  const holder = process.env.DONATE_HOLDER ?? "";
  const note = process.env.DONATE_NOTE ?? "Ca phe cho tac gia thiep cuoi";
  if (!bin || !account) return null;
  const bank = BANKS.find((b) => b.bin === bin)?.name ?? "Ngân hàng";
  return <DonateButton qr={vietQrUrl(bin, account, holder, note)} bank={bank} account={account} holder={holder} />;
}
