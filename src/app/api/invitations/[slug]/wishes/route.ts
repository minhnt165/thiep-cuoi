import { WishInputSchema, makeId, type Wish } from "@/lib/schema";
import { getStore } from "@/lib/store";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const store = await getStore();
  if (!(await store.getInvitation(slug))) return Response.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  return Response.json(await store.listWishes(slug));
}

export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const store = await getStore();
  if (!(await store.getInvitation(slug))) return Response.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  const parsed = WishInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const wish: Wish = { id: makeId(), ...parsed.data, createdAt: new Date().toISOString() };
  await store.addWish(slug, wish);
  return Response.json(wish, { status: 201 });
}
