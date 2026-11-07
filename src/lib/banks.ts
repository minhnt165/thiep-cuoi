/** Ngân hàng phổ biến với mã BIN dùng cho VietQR (img.vietqr.io) */
export const BANKS: { code: string; bin: string; name: string }[] = [
  { code: "VCB", bin: "970436", name: "Vietcombank" },
  { code: "TCB", bin: "970407", name: "Techcombank" },
  { code: "MB", bin: "970422", name: "MB Bank" },
  { code: "ACB", bin: "970416", name: "ACB" },
  { code: "VPB", bin: "970432", name: "VPBank" },
  { code: "BIDV", bin: "970418", name: "BIDV" },
  { code: "VBA", bin: "970405", name: "Agribank" },
  { code: "CTG", bin: "970415", name: "VietinBank" },
  { code: "TPB", bin: "970423", name: "TPBank" },
  { code: "STB", bin: "970403", name: "Sacombank" },
  { code: "HDB", bin: "970437", name: "HDBank" },
  { code: "VIB", bin: "970441", name: "VIB" },
  { code: "SHB", bin: "970443", name: "SHB" },
  { code: "MSB", bin: "970426", name: "MSB" },
  { code: "OCB", bin: "970448", name: "OCB" },
  { code: "SEAB", bin: "970440", name: "SeABank" },
  { code: "LPB", bin: "970449", name: "LPBank" },
  { code: "EIB", bin: "970431", name: "Eximbank" },
  { code: "NAB", bin: "970428", name: "Nam A Bank" },
  { code: "BAB", bin: "970409", name: "Bac A Bank" },
  { code: "PVCB", bin: "970412", name: "PVcomBank" },
  { code: "SCB", bin: "970429", name: "SCB" },
  { code: "VCCB", bin: "970454", name: "BVBank" },
  { code: "CAKE", bin: "546034", name: "CAKE by VPBank" },
  { code: "TIMO", bin: "963388", name: "Timo" },
];

/** Link ảnh QR chuẩn VietQR, khách quét bằng app ngân hàng bất kỳ */
export function vietQrUrl(bin: string, accountNumber: string, holder: string, addInfo = ""): string {
  const q = new URLSearchParams();
  if (holder) q.set("accountName", holder);
  if (addInfo) q.set("addInfo", addInfo);
  const qs = q.toString();
  return `https://img.vietqr.io/image/${bin}-${encodeURIComponent(accountNumber)}-compact.png${qs ? `?${qs}` : ""}`;
}
