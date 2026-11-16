/**
 * Trang chủ: giới thiệu trang Quản lý cưới, kèm bản minh họa nhỏ dựng bằng CSS
 * (không phải ảnh chụp, để luôn khớp màu trang chủ và nhẹ).
 */

const POINTS: { title: string; text: string; icon: React.ReactNode }[] = [
  { title: "Công việc theo mốc", text: "Có sẵn 27 việc từ 6 tháng trước tới sau cưới, đánh dấu xong, báo việc quá hạn.", icon: <path d="M9 6h11M9 12h11M9 18h11M4 5.5l1 1 2-2M4 11.5l1 1 2-2M4 17.5l1 1 2-2" /> },
  { title: "Chi phí & ngân sách", text: "Dự kiến, chốt giá, đã cọc, còn phải trả. Gõ tắt 500k, 15tr. Biết ngay vượt hay còn dư.", icon: <path d="M4 7h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2h11v3M16 13.5h.01" /> },
  { title: "Khách mời", text: "Nhập nhanh theo nhóm, đánh dấu đã gửi thiệp, xem ai xác nhận, chép link riêng từng người.", icon: <path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.6a3.5 3.5 0 0 1 0 6.8" /> },
  { title: "Sổ tiền mừng", text: "Ghi phong bì trong ngày cưới chỉ bằng tên và số tiền. Tổng theo nhà trai, nhà gái, xuất ra Excel.", icon: <path d="M3.5 6h17v12h-17zM3.5 6.5 12 13l8.5-6.5" /> },
];

export function PlanShowcase({ loginOn }: { loginOn: boolean }) {
  return (
    <section className="plan-show" id="quan-ly" aria-labelledby="plan-show-h">
      <div className="plan-show-text">
        <p className="home-kicker">Mới · Quản lý cưới</p>
        <h2 className="home-h2" id="plan-show-h">Không chỉ tấm thiệp, lo luôn cả đám cưới</h2>
        <p className="home-sub">
          Mỗi thiệp có một trang quản lý riêng cho cô dâu chú rể. Khách xem thiệp không bao giờ thấy trang này.
          {loginOn ? " Hai người đăng nhập bằng Google, cùng sửa trên điện thoại của mình." : ""}
        </p>
        <ul className="plan-points">
          {POINTS.map((p) => (
            <li key={p.title}>
              <span className="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p.icon}</svg></span>
              <div>
                <b>{p.title}</b>
                <p>{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="hero-cta">
          <a className="btn-main" href="#mine">Mở thiệp của tôi</a>
          <a className="btn-text" href="#create">Chưa có thiệp? Tạo mới ↓</a>
        </div>
        <p className="plan-show-hint">Đang sửa thiệp thì bấm <b>Quản lý cưới</b> ở thanh trên cùng của trình chỉnh sửa.</p>
      </div>

      {/* Minh họa trang tổng quan */}
      <div className="plan-mock" aria-hidden="true">
        <div className="pm-hero">
          <div>
            <small>Chủ nhật, 20.12.2026</small>
            <b>Tuấn &amp; Hà</b>
          </div>
          <div className="pm-cd"><b>33</b><span>ngày</span></div>
        </div>
        <div className="pm-cards">
          <div className="pm-card">
            <small>Công việc</small>
            <div className="pm-ring" style={{ "--p": "26%" } as React.CSSProperties}><span>26%</span></div>
            <em>7/27 việc xong</em>
          </div>
          <div className="pm-card">
            <small>Chi phí</small>
            <b>246 tr</b>
            <i className="pm-bar"><i style={{ width: "82%" }} /></i>
            <em>/ 300 tr ngân sách</em>
          </div>
          <div className="pm-card">
            <small>Khách mời</small>
            <b>180</b>
            <i className="pm-split"><i className="g" style={{ flexGrow: 95 }} /><i className="b" style={{ flexGrow: 85 }} /></i>
            <em>Nhà trai 95 · Nhà gái 85</em>
          </div>
          <div className="pm-card">
            <small>Tiền mừng</small>
            <b>86 tr</b>
            <i className="pm-split"><i className="g" style={{ flexGrow: 48 }} /><i className="b" style={{ flexGrow: 38 }} /></i>
            <em>124 phong bì</em>
          </div>
        </div>
        <div className="pm-list">
          <small>Việc cần làm tiếp</small>
          <p><i className="done" />Đặt cọc nhà hàng<span>Xong</span></p>
          <p><i />Gửi hết thiệp, gọi mời người lớn<span className="late">06.12</span></p>
          <p><i />Chốt số bàn với nhà hàng<span>06.12</span></p>
        </div>
      </div>
    </section>
  );
}
