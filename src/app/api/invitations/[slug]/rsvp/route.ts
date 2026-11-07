import { RsvpInputSchema, makeId, type Rsvp } from "@/lib/schema";
import { getStore } from "@/lib/store";
import { requireEditor } from "@/lib/auth";

type Ctx = { params: Promise<{ slug: string }> };

/** Danh sách xác nhận: chỉ chủ thiệp (có khóa sửa) xem được */
export async function GET(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const r = await requireEditor(req, slug);
  if (r instanceof Response) return r;
  return Response.json(await (await getStore()).listRsvps(slug));
}

export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const store = await getStore();
  if (!(await store.getInvitation(slug))) return Response.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  const parsed = RsvpInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const rsvp: Rsvp = { id: makeId(), ...parsed.data, createdAt: new Date().toISOString() };
  await store.addRsvp(slug, rsvp);
  return Response.json(rsvp, { status: 201 });
}
