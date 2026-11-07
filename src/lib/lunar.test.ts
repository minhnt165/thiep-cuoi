import { describe, expect, it } from "vitest";
import { lunarLabel, solarToLunar, yearName } from "./lunar";

describe("solarToLunar", () => {
  it("Tết Bính Ngọ 2026 rơi vào 17/02/2026", () => {
    expect(solarToLunar(17, 2, 2026)).toEqual({ day: 1, month: 1, year: 2026, leap: false });
  });
  it("Tết Ất Tỵ 2025 rơi vào 29/01/2025", () => {
    expect(solarToLunar(29, 1, 2025)).toEqual({ day: 1, month: 1, year: 2025, leap: false });
  });
  it("03/01/2026 là 15 tháng 11 năm Ất Tỵ (theo demo ChungDoi)", () => {
    expect(solarToLunar(3, 1, 2026)).toEqual({ day: 15, month: 11, year: 2025, leap: false });
  });
  it("14/02/2027 là 9 tháng 1 năm Đinh Mùi (theo demo ChungDoi)", () => {
    expect(solarToLunar(14, 2, 2027)).toEqual({ day: 9, month: 1, year: 2027, leap: false });
  });
  it("tháng nhuận: 2025 nhuận tháng 6, ngày 25/07/2025 là 1/6 nhuận", () => {
    expect(solarToLunar(25, 7, 2025)).toEqual({ day: 1, month: 6, year: 2025, leap: true });
  });
});

describe("yearName", () => {
  it("đặt tên can chi", () => {
    expect(yearName(2025)).toBe("Ất Tỵ");
    expect(yearName(2026)).toBe("Bính Ngọ");
    expect(yearName(2027)).toBe("Đinh Mùi");
    expect(yearName(2024)).toBe("Giáp Thìn");
  });
});

describe("lunarLabel", () => {
  it("tạo chuỗi hiển thị từ ISO date", () => {
    expect(lunarLabel("2026-01-03")).toBe("Ngày 15 tháng 11 năm Ất Tỵ");
    expect(lunarLabel("2026-12-20")).toBe("Ngày 12 tháng 11 năm Bính Ngọ");
  });
});
