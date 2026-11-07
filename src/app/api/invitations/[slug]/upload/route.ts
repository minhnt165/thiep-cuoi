import { getStore } from "@/lib/store";
import { requireEditor } from "@/lib/auth";
import { optimizeImage } from "@/lib/images";

type Ctx = { params: Promise<{ slug: string }> };

const MAX_IMAGE = 8 * 1024 * 1024;
const MAX_AUDIO = 15 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const AUDIO_TYPES = new Set(["audio/mpeg", "audio/mp4", "audio/ogg"]);

/** Tải ảnh hoặc nhạc lên, trả về { url } để ghi vào thiệp */
export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const r = await requireEditor(req, slug);
  if (r instanceof Response) return r;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Thiếu file" }, { status: 400 });
  const isImage = IMAGE_TYPES.has(file.type);
  const isAudio = AUDIO_TYPES.has(file.type);
  if (!isImage && !isAudio) return Response.json({ error: "Chỉ nhận ảnh JPG/PNG/WebP/GIF hoặc nhạc MP3/M4A/OGG" }, { status: 415 });
  if (file.size > (isImage ? MAX_IMAGE : MAX_AUDIO)) return Response.json({ error: `File quá lớn (tối đa ${isImage ? 8 : 15}MB)` }, { status: 413 });
  let data: Uint8Array = new Uint8Array(await file.arrayBuffer());
  let type = file.type;
  if (isImage) {
    try {
      ({ data, contentType: type } = await optimizeImage(data, type));
    } catch {
      return Response.json({ error: "Không đọc được ảnh, thử file khác" }, { status: 422 });
    }
  }
  const url = await (await getStore()).saveUpload(slug, file.name, data, type);
  return Response.json({ url }, { status: 201 });
}
