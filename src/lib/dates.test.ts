import { describe, expect, it } from "vitest";
import { countdown, googleCalendarUrl, monthGrid, weekdayLabel } from "./dates";

describe("dates", () => {
  it("weekdayLabel: 20/12/2026 là Chủ nhật, 3/1/2026 là Thứ bảy", () => {
    expect(weekdayLabel("2026-12-20")).toBe("Chủ nhật");
    expect(weekdayLabel("2026-01-03")).toBe("Thứ bảy");
  });
  it("monthGrid: tháng 12/2026 bắt đầu thứ ba (1 ô trống), 31 ngày", () => {
    const g = monthGrid("2026-12-20");
    expect(g.cells.slice(0, 2)).toEqual([null, 1]);
    expect(g.cells.filter((c) => c !== null)).toHaveLength(31);
  });
  it("countdown đếm đúng và báo đã qua", () => {
    const target = new Date("2026-12-20T04:30:00Z");
    expect(countdown(target, new Date("2026-12-19T04:30:00Z"))).toEqual({ days: 1, hours: 0, minutes: 0, seconds: 0, passed: false });
    expect(countdown(target, new Date("2027-01-01T00:00:00Z")).passed).toBe(true);
  });
  it("googleCalendarUrl ghi ngày giờ Việt Nam", () => {
    const url = googleCalendarUrl({ title: "Tiệc cưới", ymd: "2026-12-20", hm: "11:30", location: "Hà Nội" });
    expect(url).toContain("dates=20261220T113000%2F20261220T143000");
    expect(url).toContain("ctz=Asia%2FHo_Chi_Minh");
  });
});
