import { describe, expect, it } from "vitest";
import { formatMoney, formatMoneyShort, parseMoney } from "./money";

describe("money", () => {
  it("đọc số có dấu phân cách hàng nghìn", () => {
    expect(parseMoney("12.500.000")).toBe(12_500_000);
    expect(parseMoney("12,500,000")).toBe(12_500_000);
    expect(parseMoney("500000")).toBe(500_000);
    expect(parseMoney("500.000đ")).toBe(500_000);
    expect(parseMoney("")).toBe(0);
  });
  it("đọc đơn vị viết tắt", () => {
    expect(parseMoney("5tr")).toBe(5_000_000);
    expect(parseMoney("1,5 triệu")).toBe(1_500_000);
    expect(parseMoney("2.5tr")).toBe(2_500_000);
    expect(parseMoney("500k")).toBe(500_000);
    expect(parseMoney("1,2 tỷ")).toBe(1_200_000_000);
  });
  it("trả null khi không đọc được", () => {
    expect(parseMoney("abc")).toBeNull();
    expect(parseMoney("5 con gà")).toBeNull();
  });
  it("hiển thị", () => {
    expect(formatMoney(12_500_000)).toBe("12.500.000");
    expect(formatMoneyShort(12_500_000)).toBe("12,5 tr");
    expect(formatMoneyShort(1_200_000_000)).toBe("1,2 tỷ");
    expect(formatMoneyShort(500_000)).toBe("500 k");
  });
});
