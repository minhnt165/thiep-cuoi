import { makeId, type Invitation, type TemplateId } from "@/lib/schema";

/** Ảnh demo (Unsplash, xem public/demo/CREDITS.md). Chỉ trang demo dùng, thiệp mới tạo để trống. */
const DEMO_PHOTOS = {
  cover: "/demo/cover.webp",
  saveTheDate: ["/demo/groom.webp", "/demo/bride.webp"],
  album: ["/demo/album-1.webp", "/demo/album-2.webp", "/demo/album-3.webp", "/demo/album-4.webp", "/demo/album-5.webp", "/demo/album-6.webp", "/demo/album-7.webp", "/demo/album-8.webp"],
  story: ["/demo/story-1.webp", "/demo/story-2.webp", "/demo/story-3.webp"],
};

/**
 * Dữ liệu mẫu: dùng cho trang demo (withPhotos = true, có ảnh) và làm nội dung
 * khởi tạo khi tạo thiệp mới (không ảnh).
 */
export function sampleInvitation(slug: string, template: TemplateId, editKey = makeId() + makeId(), withPhotos = false): Invitation {
  const now = new Date().toISOString();
  const p = withPhotos ? DEMO_PHOTOS : null;
  return {
    slug,
    template,
    accent: "",
    groom: {
      fullName: "Nguyễn Anh Tuấn",
      shortName: "Anh Tuấn",
      role: "Trưởng nam",
      father: "Ông Nguyễn Văn Hùng",
      mother: "Bà Trần Thị Lan",
      address: "Láng Hạ, Đống Đa, Hà Nội",
    },
    bride: {
      fullName: "Lê Thu Hà",
      shortName: "Thu Hà",
      role: "Út nữ",
      father: "Ông Lê Minh Đức",
      mother: "Bà Phạm Thu Hằng",
      address: "Phố Huế, Hai Bà Trưng, Hà Nội",
    },
    mainEvent: {
      id: "party",
      title: "Tiệc cưới",
      date: "2026-12-20",
      time: "11:30",
      venue: "Trung tâm tiệc cưới Hoa Sen",
      address: "88 Trần Duy Hưng, Cầu Giấy, Hà Nội",
      mapUrl: "",
    },
    receptionTime: "11:00",
    events: [
      { id: "vuquy", title: "Lễ vu quy", date: "2026-12-20", time: "08:00", venue: "Tư gia nhà gái", address: "12 Phố Huế, Hai Bà Trưng, Hà Nội", mapUrl: "" },
      { id: "thanhhon", title: "Lễ thành hôn", date: "2026-12-20", time: "10:00", venue: "Tư gia nhà trai", address: "45 Láng Hạ, Đống Đa, Hà Nội", mapUrl: "" },
    ],
    timeline: [
      { time: "08:00", title: "Lễ gia tiên tại nhà gái" },
      { time: "09:30", title: "Đón dâu" },
      { time: "10:00", title: "Lễ gia tiên tại nhà trai" },
      { time: "11:00", title: "Đón khách" },
      { time: "11:30", title: "Nghi thức thành hôn" },
      { time: "12:00", title: "Khai tiệc" },
      { time: "13:30", title: "Cô dâu chú rể chúc mừng từng bàn" },
      { time: "14:30", title: "Kết thúc tiệc" },
    ],
    story: [
      { label: "2019", title: "Lần đầu gặp", text: "Chung một nhóm thiện nguyện ở Mộc Châu.", photo: p?.story[0] ?? "" },
      { label: "2022", title: "Chuyến đi đầu tiên", text: "Đà Lạt, mưa suốt ba ngày mà vẫn vui.", photo: p?.story[1] ?? "" },
      { label: "2026", title: "Lời cầu hôn", text: "Bên hồ Tây, một buổi tối tháng Tư.", photo: p?.story[2] ?? "" },
    ],
    dressCode: ["#2B2320", "#A8894F", "#F2EBDD"],
    photos: p ? { cover: p.cover, saveTheDate: [...p.saveTheDate], album: [...p.album] } : { cover: "", saveTheDate: [], album: [] },
    texts: {
      coverGreeting: "Thân mời",
      saveTheDate: "Save the date",
      announce: "Trân trọng báo tin lễ thành hôn của con chúng tôi",
      thanks: "Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi",
      giftIntro: "Nếu không thể đến chung vui, bạn có thể gửi quà mừng qua mã dưới đây",
    },
    gifts: [
      { id: "g1", label: "Nhà trai", bank: "Vietcombank", bankCode: "970436", accountNumber: "0011004567890", holder: "NGUYEN ANH TUAN", qrImage: "" },
      { id: "g2", label: "Nhà gái", bank: "Techcombank", bankCode: "970407", accountNumber: "19035566778899", holder: "LE THU HA", qrImage: "" },
    ],
    music: "",
    guests: [],
    sections: ["saveTheDate", "family", "album", "party", "dressCode", "timeline", "story", "guestbook", "gift"],
    editKey,
    createdAt: now,
    updatedAt: now,
  };
}

export const SAMPLE_WISHES = [
  { id: "w1", name: "Minh Anh", message: "Chúc hai bạn trăm năm hạnh phúc, sớm có tin vui nhé!", createdAt: "2026-11-01T09:00:00.000Z" },
  { id: "w2", name: "Đức Huy", message: "Cuối cùng cũng đợi được ngày này. Hẹn gặp ở tiệc!", createdAt: "2026-11-02T10:30:00.000Z" },
  { id: "w3", name: "Bà ngoại", message: "Chúc mừng hai con, cả nhà thương các con nhiều.", createdAt: "2026-11-03T14:00:00.000Z" },
];
