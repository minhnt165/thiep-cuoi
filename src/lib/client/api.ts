import type { Invitation, Rsvp, Wish } from "@/lib/schema";

/** Gọi API từ trình chỉnh sửa, luôn kèm khóa sửa */
function headers(key: string, json = true): HeadersInit {
  return json ? { "content-type": "application/json", "x-edit-key": key } : { "x-edit-key": key };
}

async function unwrap<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `Lỗi ${res.status}`);
  return body as T;
}

export const api = {
  load: (slug: string, key: string) => fetch(`/api/invitations/${slug}`, { headers: headers(key, false), cache: "no-store" }).then((r) => unwrap<Invitation>(r)),
  save: (inv: Invitation, key: string) => fetch(`/api/invitations/${inv.slug}`, { method: "PUT", headers: headers(key), body: JSON.stringify(inv) }).then((r) => unwrap<Invitation>(r)),
  rsvps: (slug: string, key: string) => fetch(`/api/invitations/${slug}/rsvp`, { headers: headers(key, false), cache: "no-store" }).then((r) => unwrap<Rsvp[]>(r)),
  wishes: (slug: string) => fetch(`/api/invitations/${slug}/wishes`, { cache: "no-store" }).then((r) => unwrap<Wish[]>(r)),
  upload: async (slug: string, key: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch(`/api/invitations/${slug}/upload`, { method: "POST", headers: headers(key, false), body: fd });
    return (await unwrap<{ url: string }>(r)).url;
  },
};
