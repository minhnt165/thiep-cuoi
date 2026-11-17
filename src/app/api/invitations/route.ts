import { z } from "zod";
import { TEMPLATE_IDS, makeId } from "@/lib/schema";
import { sampleInvitation } from "@/lib/sample";
import { getStore } from "@/lib/store";
import { authMode, getUser } from "@/lib/auth";
import { addMember } from "@/lib/members";

const CreateSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,60}$/, "Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang"),
  template: z.enum(TEMPLATE_IDS),
  code: z.string().optional(),
  /** Tên gọi hai bạn và ngày cưới nhập ngay lúc tạo, thay cho dữ liệu mẫu */
  groom: z.string().trim().max(40).optional(),
  bride: z.string().trim().max(40).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/**
 * Tạo thiệp mới từ dữ liệu mẫu. Trả về slug và khóa sửa (chỉ hiện một lần).
 * Nếu đặt biến CREATE_CODE thì phải gửi đúng mã mới tạo được (chặn tạo rác trên site thật).
 * Khi bật đăng nhập: phải đăng nhập, người tạo thành người quản lý đầu tiên.
 */
export async function POST(req: Request) {
  const body = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: body.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const required = process.env.CREATE_CODE;
  if (required && (body.data.code ?? "") !== required) return Response.json({ error: "Mã tạo thiệp không đúng" }, { status: 403 });
  const user = await getUser(req);
  if (user instanceof Response) return user;
  if (authMode() !== "off" && !user) return Response.json({ error: "Đăng nhập để tạo thiệp", code: "login" }, { status: 401 });
  try {
    const store = await getStore();
    if (await store.getInvitation(body.data.slug)) return Response.json({ error: "Đường dẫn này đã có người dùng" }, { status: 409 });
    const inv = sampleInvitation(body.data.slug, body.data.template, makeId() + makeId());
    if (user) inv.members = addMember([], user.email);
    const { groom, bride, date } = body.data;
    if (groom) inv.groom = { ...inv.groom, shortName: groom, fullName: groom };
    if (bride) inv.bride = { ...inv.bride, shortName: bride, fullName: bride };
    if (date) {
      inv.mainEvent = { ...inv.mainEvent, date };
      inv.events = inv.events.map((ev) => ({ ...ev, date }));
    }
    await store.saveInvitation(inv);
    return Response.json({ slug: inv.slug, editKey: inv.editKey }, { status: 201 });
  } catch (e) {
    console.error("Tạo thiệp lỗi:", e);
    return Response.json({ error: `Không lưu được thiệp: ${(e as Error).message}` }, { status: 500 });
  }
}

/** Danh sách thiệp: chỉ khi chạy trên máy cá nhân, không mở trên site thật */
export async function GET() {
  if (process.env.STORE === "supabase") return Response.json({ error: "Không khả dụng" }, { status: 404 });
  const store = await getStore();
  return Response.json(await store.listInvitations());
}
