import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { InvitationSchema, RsvpSchema, WishSchema } from "@/lib/schema";
import type { Store } from "./types";

/**
 * Bản Supabase. Cần ba biến môi trường:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STORE=supabase
 * Bảng và bucket xem supabase/migrations/0001_init.sql.
 * Chỉ dùng ở server (service role), không bao giờ gửi key xuống trình duyệt.
 */

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

const BUCKET = "uploads";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/ogg": ".ogg",
};

export const supabaseStore: Store = {
  async getInvitation(slug) {
    const { data, error } = await db().from("invitations").select("data").eq("slug", slug).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const parsed = InvitationSchema.safeParse(data.data);
    return parsed.success ? parsed.data : null;
  },

  async saveInvitation(inv) {
    const { error } = await db()
      .from("invitations")
      .upsert({ slug: inv.slug, data: inv, updated_at: inv.updatedAt }, { onConflict: "slug" });
    if (error) throw error;
  },

  async listInvitations() {
    const { data, error } = await db().from("invitations").select("data").order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? [])
      .map((r) => InvitationSchema.safeParse(r.data))
      .flatMap((r) => (r.success ? [r.data] : []))
      .map(({ slug, template, groom, bride, mainEvent, updatedAt }) => ({ slug, template, groom, bride, mainEvent, updatedAt }));
  },

  async listWishes(slug) {
    const { data, error } = await db().from("wishes").select("data").eq("slug", slug).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => WishSchema.safeParse(r.data)).flatMap((r) => (r.success ? [r.data] : []));
  },

  async addWish(slug, wish) {
    const { error } = await db().from("wishes").insert({ id: wish.id, slug, data: wish, created_at: wish.createdAt });
    if (error) throw error;
  },

  async listRsvps(slug) {
    const { data, error } = await db().from("rsvps").select("data").eq("slug", slug).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => RsvpSchema.safeParse(r.data)).flatMap((r) => (r.success ? [r.data] : []));
  },

  async addRsvp(slug, rsvp) {
    const { error } = await db().from("rsvps").insert({ id: rsvp.id, slug, data: rsvp, created_at: rsvp.createdAt });
    if (error) throw error;
  },

  async saveUpload(slug, fileName, data, contentType) {
    // Đuôi file theo nội dung thật (ảnh đã được nén sang WebP trước khi lưu)
    const base = fileName.replace(/\.[^.]*$/, "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40) || "file";
    const key = `${slug}/${Date.now().toString(36)}-${base}${MIME_EXT[contentType] ?? ""}`;
    const { error } = await db().storage.from(BUCKET).upload(key, data, { contentType, upsert: false });
    if (error) throw error;
    return db().storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
  },
};
