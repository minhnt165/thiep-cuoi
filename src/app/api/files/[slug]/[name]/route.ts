import { getStore } from "@/lib/store";

type Ctx = { params: Promise<{ slug: string; name: string }> };

/** Phục vụ file đã tải lên khi dùng STORE=file */
export async function GET(_req: Request, { params }: Ctx) {
  const { slug, name } = await params;
  const store = await getStore();
  if (!store.readUpload) return new Response("Not found", { status: 404 });
  let file: Awaited<ReturnType<NonNullable<typeof store.readUpload>>>;
  try {
    file = await store.readUpload(slug, name);
  } catch {
    file = null;
  }
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Blob([file.data as BlobPart]), {
    headers: { "content-type": file.contentType, "cache-control": "public, max-age=31536000, immutable" },
  });
}
