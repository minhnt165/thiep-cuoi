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

export function forgetKey(slug: string): void {
  try {
    localStorage.removeItem(prefix + slug);
  } catch {
    /* bỏ qua */
  }
}
