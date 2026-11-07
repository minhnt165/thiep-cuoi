import Image from "next/image";
import Link from "next/link";
import { THEME_LIST } from "@/lib/templates";
import { getStore } from "@/lib/store";
import { CreateForm } from "@/components/editor/CreateForm";
import "./home.css";

// Danh sách thiệp đọc từ store mỗi lần mở trang
export const dynamic = "force-dynamic";

/** Ảnh chụp bìa thật của từng mẫu, sinh bằng `node scripts/shoot-templates.mjs` (840×1280) */
const shot = (id: string) => `/templates/${id}.webp`;

const FEATURES: { title: string; text: string; icon: React.ReactNode }[] = [
  { title: "Bìa mở có hiệu ứng", text: "Phong bì, dấu sáp, ảnh vòm, vòng hoa… mỗi mẫu một kiểu mở.", icon: <path d="M3 8l9 6 9-6M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" /> },
  { title: "Đếm ngược & lịch", text: "Ngày dương, ngày âm, lịch tháng có tim đánh dấu, nút thêm vào Google Calendar.", icon: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></> },
  { title: "Chỉ đường từng lễ", text: "Vu quy nhà gái, thành hôn nhà trai, tiệc nhà hàng: mỗi nơi một map riêng.", icon: <><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2" /></> },
  { title: "Album 3D & ảnh ngang", text: "Thẻ ảnh lật 3D, vuốt trên điện thoại, xem toàn màn hình. Ảnh ngang hiện trọn.", icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m3 16 5-5 4 4 3-3 6 6" /><circle cx="16" cy="9" r="1.5" /></> },
  { title: "Mừng cưới bằng QR", text: "Chọn ngân hàng, nhập số tài khoản là có mã VietQR, khách quét là chuyển.", icon: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14h1" /></> },
  { title: "Link riêng từng khách", text: "Mỗi khách một link, tên hiện trên bìa và điền sẵn ở phần xác nhận tham dự.", icon: <><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" /></> },
];

const STEPS = [
  { n: "01", title: "Chọn mẫu", text: "Xem thử từng mẫu với dữ liệu giả. Đổi mẫu sau vẫn được, nội dung không mất." },
  { n: "02", title: "Điền thông tin, tải ảnh", text: "Tên, bố mẹ, giờ lễ, địa điểm, album, tài khoản mừng cưới. Xem trước ngay trên khung điện thoại." },
  { n: "03", title: "Gửi link cho khách", text: "Một link chung hoặc link riêng từng người. Khách xác nhận tham dự, gửi lời chúc ngay trên thiệp." },
];

export default async function Home() {
  // Danh sách thiệp chỉ hiện khi chạy trên máy cá nhân (file store).
  // Trên site thật (Supabase) ai cũng vào được trang chủ nên không lộ thiệp của người khác.
  const isLocal = process.env.STORE !== "supabase";
  const list = isLocal ? await (await getStore()).listInvitations() : [];
  const needsCode = Boolean(process.env.CREATE_CODE);
  const fan = ["blush-rose", "marble-gold", "navy-gold"];

  return (
    <main className="home">
      <header className="hero">
        <div className="hero-text">
          <p className="home-kicker">Thiệp cưới online</p>
          <h1>Một chiếc thiệp đẹp như thiệp in, gửi bằng một đường link</h1>
          <p className="home-lede">
            Chọn mẫu, điền thông tin, tải ảnh: xong trong một buổi tối. Khách mở thiệp trên điện thoại, xem lịch, chỉ đường, xác nhận tham dự và gửi lời chúc ngay trên đó.
          </p>
          <div className="hero-cta">
            <a className="btn-main" href="#create">Tạo thiệp ngay</a>
            <a className="btn-text" href="#templates">Xem {THEME_LIST.length} mẫu ↓</a>
          </div>
        </div>
        <div className="hero-fan" aria-hidden="true">
          {fan.map((id, i) => (
            <div className={`fan fan-${i + 1}`} key={id}>
              <Image src={shot(id)} alt="" width={420} height={640} priority={i === 1} />
            </div>
          ))}
        </div>
      </header>

      <section className="features" aria-label="Tính năng">
        {FEATURES.map((f) => (
          <div className="feat" key={f.title}>
            <span className="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{f.icon}</svg></span>
            <b>{f.title}</b>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <section id="templates">
        <div className="sec-head">
          <h2 className="home-h2">Mẫu thiệp</h2>
          <p className="home-sub">Mỗi mẫu một ngôn ngữ riêng: màu, chữ, họa tiết, kiểu bìa và cả cách mở thiệp.</p>
        </div>
        <div className="tpl-grid">
          {THEME_LIST.map((t) => (
            <article className="tpl" key={t.id} style={{ "--c-outer": t.colors.outer } as React.CSSProperties}>
              <Link href={`/demo/${t.id}`} className="tpl-thumb" aria-label={`Xem thử mẫu ${t.name}`}>
                <Image src={shot(t.id)} alt={`Bìa mẫu ${t.name}`} width={420} height={640} />
                <span className="tpl-hover">Xem thử</span>
              </Link>
              <div className="tpl-body">
                <p className="tpl-tag">{t.tagline}</p>
                <h3>{t.name}</h3>
                <p className="tpl-desc">{t.description}</p>
                <div className="tpl-actions">
                  <Link className="tpl-link" href={`/demo/${t.id}`}>Xem thử</Link>
                  <a className="tpl-link tpl-link-ghost" href={`#create`}>Dùng mẫu này</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="steps" aria-label="Cách làm">
        {STEPS.map((s) => (
          <div className="step" key={s.n}>
            <span className="step-n">{s.n}</span>
            <b>{s.title}</b>
            <p>{s.text}</p>
          </div>
        ))}
      </section>

      <section className="home-create" id="create">
        <div className="sec-head">
          <h2 className="home-h2">Tạo thiệp mới</h2>
          <p className="home-sub">Miễn phí. Sau khi tạo bạn nhận một link chỉnh sửa riêng, giữ kỹ để sửa thiệp về sau.</p>
        </div>
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

      <footer className="home-foot">
        <span>Thiệp cưới online · mã nguồn mở, tự chạy trên Vercel + Supabase</span>
      </footer>
    </main>
  );
}
