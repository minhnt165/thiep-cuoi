import { z } from "zod";
import { getStore } from "@/lib/store";
import { requireMember } from "@/lib/auth";
import { addMember, EmailSchema, removeMember } from "@/lib/members";

type Ctx = { params: Promise<{ slug: string }> };

const Body = z.object({ email: EmailSchema });

/** Danh sách người quản lý thiệp: chỉ thành viên xem và sửa được */
export async function GET(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const r = await requireMember(req, slug);
  if (r instanceof Response) return r;
  return Response.json({ members: r.inv.members, me: r.user.email });
}

/** Mời thêm người quản lý bằng email tài khoản Google của họ */
export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const r = await requireMember(req, slug);
  if (r instanceof Response) return r;
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: body.error.issues[0]?.message ?? "Email không hợp lệ" }, { status: 400 });
  const members = addMember(r.inv.members, body.data.email, r.user.email);
  if (members.length > 20) return Response.json({ error: "Tối đa 20 người quản lý" }, { status: 400 });
  await (await getStore()).saveInvitation({ ...r.inv, members, updatedAt: new Date().toISOString() });
  return Response.json({ members, me: r.user.email });
}

/** Bỏ một người quản lý (kể cả chính mình), trừ người cuối cùng */
export async function DELETE(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const r = await requireMember(req, slug);
  if (r instanceof Response) return r;
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: body.error.issues[0]?.message ?? "Email không hợp lệ" }, { status: 400 });
  const out = removeMember(r.inv.members, body.data.email);
  if ("error" in out) return Response.json({ error: out.error }, { status: 400 });
  await (await getStore()).saveInvitation({ ...r.inv, members: out.members, updatedAt: new Date().toISOString() });
  return Response.json({ members: out.members, me: r.user.email });
}
