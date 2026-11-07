import "server-only";
import type { Store } from "./types";

export type { Store } from "./types";

let cached: Store | null = null;

/** Trả về store theo biến môi trường STORE ("file" mặc định, hoặc "supabase"). */
export async function getStore(): Promise<Store> {
  if (cached) return cached;
  if (process.env.STORE === "supabase") {
    cached = (await import("./supabase-store")).supabaseStore;
  } else {
    cached = (await import("./file-store")).fileStore;
  }
  return cached;
}
