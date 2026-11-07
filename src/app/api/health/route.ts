import { getStore } from "@/lib/store";

/** Báo cấu hình đang chạy để kiểm tra sau khi deploy. Không trả về khóa. */
export async function GET() {
  const store = process.env.STORE === "supabase" ? "supabase" : "file";
  const info: Record<string, unknown> = {
    store,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "đã đặt" : "thiếu",
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "đã đặt" : "thiếu",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "thiếu",
  };
  try {
    const list = await (await getStore()).listInvitations();
    info.storeOk = true;
    info.invitations = list.length;
  } catch (e) {
    info.storeOk = false;
    info.storeError = (e as Error).message;
  }
  return Response.json(info, { status: info.storeOk ? 200 : 500 });
}
