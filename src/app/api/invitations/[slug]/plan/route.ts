import { PlanSchema, seedPlan } from "@/lib/plan";
import { getStore } from "@/lib/store";
import { requireEditor } from "@/lib/auth";

type Ctx = { params: Promise<{ slug: string }> };

/** Sổ kế hoạch cưới, chỉ chủ thiệp. Chưa có thì trả bản mẫu (chưa lưu) với việc cần làm theo mốc. */
export async function GET(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const inv = await requireEditor(req, slug);
  if (inv instanceof Response) return inv;
  const plan = await (await getStore()).getPlan(slug);
  return Response.json(plan ?? seedPlan(inv.mainEvent.date));
}

export async function PUT(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const inv = await requireEditor(req, slug);
  if (inv instanceof Response) return inv;
  const body = await req.json().catch(() => null);
  const parsed = PlanSchema.safeParse({ ...body, updatedAt: new Date().toISOString() });
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return Response.json({ error: `${i?.path.join(".")}: ${i?.message}` }, { status: 400 });
  }
  await (await getStore()).savePlan(slug, parsed.data);
  return Response.json(parsed.data);
}
