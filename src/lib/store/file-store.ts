import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { InvitationSchema, RsvpSchema, WishSchema, type Invitation, type Rsvp, type Wish } from "@/lib/schema";
import type { Store } from "./types";

const ROOT = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), "data");

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/ogg": ".ogg",
};
const EXT_MIME: Record<string, string> = Object.fromEntries(Object.entries(MIME_EXT).map(([m, e]) => [e, m]));

function safeSlug(slug: string): string {
  if (!/^[a-z0-9-]{3,60}$/.test(slug)) throw new Error("slug không hợp lệ");
  return slug;
}

function safeFileName(name: string): string {
  const base = path.basename(name);
  if (!/^[a-zA-Z0-9._-]+$/.test(base)) throw new Error("tên file không hợp lệ");
  return base;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw e;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

const invFile = (slug: string) => path.join(ROOT, "invitations", `${safeSlug(slug)}.json`);
const wishFile = (slug: string) => path.join(ROOT, "wishes", `${safeSlug(slug)}.json`);
const rsvpFile = (slug: string) => path.join(ROOT, "rsvps", `${safeSlug(slug)}.json`);
const uploadDir = (slug: string) => path.join(ROOT, "uploads", safeSlug(slug));

export const fileStore: Store = {
  async getInvitation(slug) {
    const raw = await readJson<unknown>(invFile(slug), null);
    if (!raw) return null;
    const parsed = InvitationSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  },

  async saveInvitation(inv) {
    await writeJson(invFile(inv.slug), inv);
  },

  async listInvitations() {
    const dir = path.join(ROOT, "invitations");
    let files: string[] = [];
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
    } catch {
      return [];
    }
    const out: Invitation[] = [];
    for (const f of files) {
      const parsed = InvitationSchema.safeParse(await readJson<unknown>(path.join(dir, f), null));
      if (parsed.success) out.push(parsed.data);
    }
    return out
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(({ slug, template, groom, bride, mainEvent, updatedAt }) => ({ slug, template, groom, bride, mainEvent, updatedAt }));
  },

  async listWishes(slug) {
    const raw = await readJson<unknown[]>(wishFile(slug), []);
    return raw.map((w) => WishSchema.safeParse(w)).flatMap((r) => (r.success ? [r.data] : []));
  },

  async addWish(slug, wish: Wish) {
    const list = await this.listWishes(slug);
    await writeJson(wishFile(slug), [wish, ...list]);
  },

  async listRsvps(slug) {
    const raw = await readJson<unknown[]>(rsvpFile(slug), []);
    return raw.map((r) => RsvpSchema.safeParse(r)).flatMap((r) => (r.success ? [r.data] : []));
  },

  async addRsvp(slug, rsvp: Rsvp) {
    const list = await this.listRsvps(slug);
    await writeJson(rsvpFile(slug), [rsvp, ...list]);
  },

  async saveUpload(slug, fileName, data, contentType) {
    const ext = MIME_EXT[contentType];
    if (!ext) throw new Error("Định dạng không hỗ trợ");
    const name = safeFileName(fileName.replace(/\.[^.]*$/, "") || "file").slice(0, 40) + "-" + Date.now().toString(36) + ext;
    const dir = uploadDir(slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), data);
    return `/api/files/${slug}/${name}`;
  },

  async readUpload(slug, fileName) {
    const name = safeFileName(fileName);
    const contentType = EXT_MIME[path.extname(name).toLowerCase()];
    if (!contentType) return null;
    try {
      const data = await readFile(path.join(uploadDir(slug), name));
      return { data: new Uint8Array(data), contentType };
    } catch {
      return null;
    }
  },
};
