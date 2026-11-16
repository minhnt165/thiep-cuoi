import { describe, expect, it } from "vitest";
import { addMember, isMember, removeMember, type Member } from "./members";

const m = (email: string): Member => ({ email, addedAt: "2026-11-16T00:00:00Z", addedBy: "" });

describe("members", () => {
  it("so email không phân biệt hoa thường, khoảng trắng", () => {
    expect(isMember([m("ha@gmail.com")], " Ha@Gmail.com ")).toBe(true);
    expect(isMember([m("ha@gmail.com")], "tuan@gmail.com")).toBe(false);
    expect(isMember([], "ha@gmail.com")).toBe(false);
    expect(isMember([m("ha@gmail.com")], null)).toBe(false);
  });
  it("thêm không trùng, ghi người mời", () => {
    const list = addMember([m("ha@gmail.com")], "Tuan@Gmail.com", "ha@gmail.com");
    expect(list.map((x) => x.email)).toEqual(["ha@gmail.com", "tuan@gmail.com"]);
    expect(list[1].addedBy).toBe("ha@gmail.com");
    expect(addMember(list, "TUAN@gmail.com")).toBe(list);
  });
  it("không bỏ được người cuối cùng", () => {
    expect(removeMember([m("ha@gmail.com")], "ha@gmail.com")).toEqual({ error: "Thiệp cần ít nhất một người quản lý" });
    expect(removeMember([m("ha@gmail.com"), m("tuan@gmail.com")], "HA@gmail.com")).toEqual({ members: [m("tuan@gmail.com")] });
    expect(removeMember([m("ha@gmail.com"), m("tuan@gmail.com")], "x@gmail.com")).toHaveProperty("error");
  });
});
