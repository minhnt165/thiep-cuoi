import Link from "next/link";
import { THEME_LIST } from "@/lib/templates";
import { getStore } from "@/lib/store";
import { CreateForm } from "@/components/editor/CreateForm";
import "./home.css";

// Danh sách thiệp đọc từ store mỗi lần mở trang
export const dynamic = "force-dynamic";

export default async function Home() {
  // Danh sách thiệp chỉ hiện khi chạy trên máy cá nhân (file store).
  // Trên site thật (Supabase) ai cũng vào được trang chủ nên không lộ thiệp của người khác.
  const isLocal = process.env.STORE !== "supabase";
  const list = isLocal ? await (await getStore()).listInvitations() : [];
  const needsCode = Boolean(process.env.CREATE_CODE);
  return (
    <main className="home">
      <header className="home-head">
        <p className="home-kicker">Thiệp cưới online</p>
        <h1>Chọn mẫu, điền thông tin, gửi link cho khách</h1>
        <p className="home-lede">
          Mỗi thiệp có bìa mở, đếm ngược, lịch lễ kèm chỉ đường, album, sổ lưu bút, xác nhận tham dự và hộp mừng cưới. Đổi mẫu bất cứ lúc nào, nội dung giữ nguyên.
        </p>
      </header>

      <section>
        <h2 className="home-h2">Mẫu thiệp</h2>
        <div className="tpl-grid">
          {THEME_LIST.map((t) => (
            <article className="tpl" key={t.id} style={{ "--c-accent": t.colors.accent, "--c-bg": t.colors.bg, "--c-gold": t.colors.gold, "--c-outer": t.colors.outer } as React.CSSProperties}>
              <div className="tpl-thumb">
                <div className="tpl-card">
                  <span className="tpl-heart" />
                  <span className="tpl-line tpl-line-1" />
                  <span className="tpl-line tpl-line-2" />
                  <span className="tpl-dot" />
                  <span className="tpl-btn" />
                </div>
              </div>
              <div className="tpl-body">
                <p className="tpl-tag">{t.tagline}</p>
                <h3>{t.name}</h3>
                <p className="tpl-desc">{t.description}</p>
                <Link className="tpl-link" href={`/demo/${t.id}`}>Xem thử</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-create">
        <h2 className="home-h2">Tạo thiệp mới</h2>
        <CreateForm needsCode={needsCode} />
      </section>

      {list.length > 0 && (
        <section>
          <h2 className="home-h2">Thiệp đã tạo trên máy này</h2>
          <ul className="inv-list">
            {list.map((i) => (
              <li key={i.slug}>
                <div>
                  <b>{i.groom.shortName} &amp; {i.bride.shortName}</b>
                  <span>/{i.slug} · {i.mainEvent.date} · {THEME_LIST.find((t) => t.id === i.template)?.name}</span>
                </div>
                <div className="inv-list-actions">
                  <Link href={`/${i.slug}`}>Xem</Link>
                  <Link href={`/edit/${i.slug}`}>Sửa</Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
