import { InvitationSchema, toPublic } from "@/lib/schema";
import { getStore } from "@/lib/store";
import { hasCredentials, requireEditor } from "@/lib/auth";

type Ctx = { params: Promise<{ slug: string }> };

/** Có khóa sửa hoặc đăng nhập → trả toàn bộ; không có → chỉ phần công khai */
export async function GET(req: Request, { params }: Ctx) {
  const { slug } = await params;
  if (hasCredentials(req)) {
    const r = await requireEditor(req, slug);
    return r instanceof Response ? r : Response.json(r);
  }
  const inv = await (await getStore()).getInvitation(slug);
  if (!inv) return Response.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  return Response.json(toPublic(inv));
}

/**
 * Lưu toàn bộ nội dung thiệp. slug và editKey không đổi được qua API này.
 * Danh sách khách và người quản lý giữ nguyên: sửa qua /guests và /members, để
 * trình chỉnh sửa mở từ trước không ghi đè danh sách cũ lên.
 */
export async function PUT(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const current = await requireEditor(req, slug);
  if (current instanceof Response) return current;
  const body = await req.json().catch(() => null);
  const parsed = InvitationSchema.safeParse({ ...body, slug: current.slug, editKey: current.editKey, guests: current.guests, members: current.members, createdAt: current.createdAt, updatedAt: new Date().toISOString() });
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return Response.json({ error: `${i?.path.join(".")}: ${i?.message}` }, { status: 400 });
  }
  await (await getStore()).saveInvitation(parsed.data);
  return Response.json(parsed.data);
}
