import { getStore } from "@/lib/store";
import { getUser } from "@/lib/auth";

/** Thiệp mà người đang đăng nhập quản lý */
export async function GET(req: Request) {
  const user = await getUser(req);
  if (user instanceof Response) return user;
  if (!user) return Response.json({ error: "Đăng nhập để xem thiệp của bạn", code: "login" }, { status: 401 });
  return Response.json(await (await getStore()).listInvitationsFor(user.email));
}
