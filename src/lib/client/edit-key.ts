/** Khóa sửa lưu trong trình duyệt của chủ thiệp (giai đoạn chưa có tài khoản). */

const prefix = "thiep:editKey:";

export function rememberKey(slug: string, key: string): void {
  try {
    localStorage.setItem(prefix + slug, key);
  } catch {
    /* chế độ riêng tư, bỏ qua */
  }
}

export function readKey(slug: string): string {
  try {
    return localStorage.getItem(prefix + slug) ?? "";
  } catch {
    return "";
  }
}

/** Các thiệp mà trình duyệt này đang giữ khóa sửa */
export function rememberedSlugs(): string[] {
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .map((k) => k.slice(prefix.length))
      .filter((s) => /^[a-z0-9-]{3,60}$/.test(s));
  } catch {
    return [];
  }
}

export function forgetKey(slug: string): void {
  try {
    localStorage.removeItem(prefix + slug);
  } catch {
    /* bỏ qua */
  }
}
