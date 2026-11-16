import { z } from "zod";
import { GuestSchema } from "@/lib/schema";
import { getStore } from "@/lib/store";
import { requireEditor } from "@/lib/auth";

type Ctx = { params: Promise<{ slug: string }> };

const BodySchema = z.object({ guests: z.array(GuestSchema).max(3000) });

/** Lưu riêng danh sách khách (trang Quản lý cưới), không đụng nội dung thiệp. */
export async function PUT(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const inv = await requireEditor(req, slug);
  if (inv instanceof Response) return inv;
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return Response.json({ error: `${i?.path.join(".")}: ${i?.message}` }, { status: 400 });
  }
  await (await getStore()).saveInvitation({ ...inv, guests: parsed.data.guests, updatedAt: new Date().toISOString() });
  return Response.json({ guests: parsed.data.guests });
}
