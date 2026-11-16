import { z } from "zod";
import { getStore } from "@/lib/store";
import { editKeyMatches, getUser } from "@/lib/auth";
import { addMember } from "@/lib/members";

type Ctx = { params: Promise<{ slug: string }> };

/**
 * Nhận thiệp chưa có người quản lý về tài khoản đang đăng nhập, bằng khóa sửa.
 * Thiệp đã có người quản lý thì không nhận được nữa: phải nhờ họ mời.
 */
export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const user = await getUser(req);
  if (user instanceof Response) return user;
  if (!user) return Response.json({ error: "Đăng nhập để nhận thiệp", code: "login" }, { status: 401 });
  const body = z.object({ key: z.string().trim().min(1, "Nhập khóa sửa") }).safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: body.error.issues[0]?.message ?? "Nhập khóa sửa" }, { status: 400 });

  const store = await getStore();
  const inv = await store.getInvitation(slug);
  if (!inv) return Response.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  if (inv.members.length > 0) return Response.json({ error: "Thiệp đã có người quản lý. Nhờ họ mời email của bạn.", code: "not_member" }, { status: 409 });

  if (!editKeyMatches(inv, body.data.key)) return Response.json({ error: "Khóa sửa không đúng", code: "key" }, { status: 403 });

  const members = addMember(inv.members, user.email);
  await store.saveInvitation({ ...inv, members, updatedAt: new Date().toISOString() });
  return Response.json({ members });
}
