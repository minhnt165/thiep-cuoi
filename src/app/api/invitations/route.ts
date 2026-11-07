import { z } from "zod";
import { TEMPLATE_IDS, makeId } from "@/lib/schema";
import { sampleInvitation } from "@/lib/sample";
import { getStore } from "@/lib/store";

const CreateSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,60}$/, "Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang"),
  template: z.enum(TEMPLATE_IDS),
});

/** Tạo thiệp mới từ dữ liệu mẫu. Trả về slug và khóa sửa (chỉ hiện một lần). */
export async function POST(req: Request) {
  const body = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: body.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const store = await getStore();
  if (await store.getInvitation(body.data.slug)) return Response.json({ error: "Đường dẫn này đã có người dùng" }, { status: 409 });
  const inv = sampleInvitation(body.data.slug, body.data.template, makeId() + makeId());
  await store.saveInvitation(inv);
  return Response.json({ slug: inv.slug, editKey: inv.editKey }, { status: 201 });
}

export async function GET() {
  const store = await getStore();
  return Response.json(await store.listInvitations());
}
