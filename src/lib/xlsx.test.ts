import { describe, expect, it } from "vitest";
import { buildXlsx, colName, crc32 } from "./xlsx";

describe("xlsx", () => {
  it("tên cột kiểu Excel", () => {
    expect([0, 25, 26, 27, 51, 52, 701, 702].map(colName)).toEqual(["A", "Z", "AA", "AB", "AZ", "BA", "ZZ", "AAA"]);
  });

  it("crc32 khớp giá trị chuẩn", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });

  it("ra file zip đủ các phần của một bảng tính", () => {
    const bytes = buildXlsx({
      name: "Tiền mừng",
      header: ["Tên", "Số tiền"],
      rows: [["Cô Lan & chú <Ba>", 2_000_000], ["Anh Quân", 500_000]],
      moneyCols: [1],
      totalCols: [1],
    });
    // Chữ ký zip "PK\x03\x04" ở đầu, "PK\x05\x06" (kết thúc thư mục) ở cuối
    expect([...bytes.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect([...bytes.slice(-22, -18)]).toEqual([0x50, 0x4b, 0x05, 0x06]);

    const text = new TextDecoder().decode(bytes);
    for (const part of ["[Content_Types].xml", "xl/workbook.xml", "xl/styles.xml", "xl/worksheets/sheet1.xml"]) expect(text).toContain(part);
    // Ký tự đặc biệt được thoát, số tiền là số, có dòng tổng
    expect(text).toContain("Cô Lan &amp; chú &lt;Ba&gt;");
    expect(text).toContain('<c r="B2" s="2"><v>2000000</v></c>');
    expect(text).toContain("<f>SUM(B2:B3)</f>");
    expect(text).toContain('state="frozen"');
  });
});
