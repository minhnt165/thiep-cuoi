import { z } from "zod";
import { getStore } from "@/lib/store";
import { requireEditor } from "@/lib/auth";

type Ctx = { params: Promise<{ slug: string }> };

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const AUDIO_TYPES = new Set(["audio/mpeg", "audio/mp4", "audio/ogg"]);
const MAX = { image: 8 * 1024 * 1024, audio: 15 * 1024 * 1024 };

const Body = z.object({ fileName: z.string().min(1).max(200), contentType: z.string(), size: z.number().int().nonnegative() });

/**
 * Cấp link ký sẵn để trình duyệt tải thẳng lên Supabase Storage.
 * Trả { uploadUrl: null } khi store không hỗ trợ (file store): client dùng /upload.
 */
export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const r = await requireEditor(req, slug);
  if (r instanceof Response) return r;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  const { fileName, contentType, size } = parsed.data;
  const isImage = IMAGE_TYPES.has(contentType);
  const isAudio = AUDIO_TYPES.has(contentType);
  if (!isImage && !isAudio) return Response.json({ error: "Chỉ nhận ảnh JPG/PNG/WebP/GIF hoặc nhạc MP3/M4A/OGG" }, { status: 415 });
  if (size > (isImage ? MAX.image : MAX.audio)) return Response.json({ error: `File quá lớn (tối đa ${isImage ? 8 : 15}MB)` }, { status: 413 });
  const store = await getStore();
  if (!store.createSignedUpload) return Response.json({ uploadUrl: null });
  const signed = await store.createSignedUpload(slug, fileName, contentType);
  return Response.json(signed);
}
