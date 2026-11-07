import { InvitationSchema, toPublic } from "@/lib/schema";
import { getStore } from "@/lib/store";
import { requireEditor, EDIT_KEY_HEADER } from "@/lib/auth";

type Ctx = { params: Promise<{ slug: string }> };

/** Có khóa sửa → trả toàn bộ; không có → chỉ phần công khai */
export async function GET(req: Request, { params }: Ctx) {
  const { slug } = await params;
  if (req.headers.get(EDIT_KEY_HEADER)) {
    const r = await requireEditor(req, slug);
    return r instanceof Response ? r : Response.json(r);
  }
  const inv = await (await getStore()).getInvitation(slug);
  if (!inv) return Response.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  return Response.json(toPublic(inv));
}

/** Lưu toàn bộ nội dung thiệp. slug và editKey không đổi được qua API này. */
export async function PUT(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const current = await requireEditor(req, slug);
  if (current instanceof Response) return current;
  const body = await req.json().catch(() => null);
  const parsed = InvitationSchema.safeParse({ ...body, slug: current.slug, editKey: current.editKey, createdAt: current.createdAt, updatedAt: new Date().toISOString() });
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return Response.json({ error: `${i?.path.join(".")}: ${i?.message}` }, { status: 400 });
  }
  await (await getStore()).saveInvitation(parsed.data);
  return Response.json(parsed.data);
}
