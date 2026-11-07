import { z } from "zod";

/**
 * Mô hình dữ liệu một thiệp. Nội dung tách khỏi mẫu (template):
 * đổi mẫu chỉ đổi giao diện, dữ liệu giữ nguyên.
 */

export const TEMPLATE_IDS = ["marble-gold", "burgundy-envelope", "song-hy", "white-blossom"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const SECTION_IDS = [
  "saveTheDate",
  "family",
  "album",
  "party",
  "dressCode",
  "timeline",
  "story",
  "guestbook",
  "gift",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

const trimmed = z.string().trim();

export const PersonSchema = z.object({
  fullName: trimmed.min(1, "Nhập họ tên"),
  shortName: trimmed.min(1, "Nhập tên gọi"),
  /** "Trưởng nam", "Út nữ", … */
  role: trimmed.default(""),
  father: trimmed.default(""),
  mother: trimmed.default(""),
  address: trimmed.default(""),
});

export const EventSchema = z.object({
  id: trimmed.min(1),
  title: trimmed.min(1, "Nhập tên sự kiện"),
  /** YYYY-MM-DD */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày dạng YYYY-MM-DD"),
  /** HH:mm */
  time: z.string().regex(/^\d{2}:\d{2}$/, "Giờ dạng HH:mm"),
  venue: trimmed.default(""),
  address: trimmed.default(""),
  mapUrl: trimmed.default(""),
});

export const TimelineItemSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  title: trimmed.min(1),
});

export const StoryItemSchema = z.object({
  label: trimmed.default(""),
  title: trimmed.min(1),
  text: trimmed.default(""),
  photo: trimmed.default(""),
});

export const GiftAccountSchema = z.object({
  id: trimmed.min(1),
  label: trimmed.default(""),
  bank: trimmed.default(""),
  accountNumber: trimmed.default(""),
  holder: trimmed.default(""),
  qrImage: trimmed.default(""),
});

export const InvitationSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]{3,60}$/, "Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang"),
  template: z.enum(TEMPLATE_IDS),
  /** Màu nhấn ghi đè màu của mẫu, để trống thì dùng màu mẫu */
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).or(z.literal("")).default(""),
  groom: PersonSchema,
  bride: PersonSchema,
  /** Tiệc chính, dùng cho đếm ngược và lịch tháng */
  mainEvent: EventSchema,
  /** Giờ đón khách của tiệc chính, HH:mm hoặc rỗng */
  receptionTime: z.string().regex(/^\d{2}:\d{2}$/).or(z.literal("")).default(""),
  events: z.array(EventSchema).default([]),
  timeline: z.array(TimelineItemSchema).default([]),
  story: z.array(StoryItemSchema).default([]),
  dressCode: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).default([]),
  photos: z
    .object({
      cover: trimmed.default(""),
      saveTheDate: z.array(trimmed).default([]),
      album: z.array(trimmed).default([]),
    })
    .default({ cover: "", saveTheDate: [], album: [] }),
  texts: z
    .object({
      coverGreeting: trimmed.default("Thân mời"),
      saveTheDate: trimmed.default("Save the date"),
      announce: trimmed.default("Trân trọng báo tin lễ thành hôn của con chúng tôi"),
      thanks: trimmed.default("Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi"),
      giftIntro: trimmed.default("Nếu không thể đến chung vui, bạn có thể gửi quà mừng qua mã dưới đây"),
    })
    .default({
      coverGreeting: "Thân mời",
      saveTheDate: "Save the date",
      announce: "Trân trọng báo tin lễ thành hôn của con chúng tôi",
      thanks: "Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi",
      giftIntro: "Nếu không thể đến chung vui, bạn có thể gửi quà mừng qua mã dưới đây",
    }),
  gifts: z.array(GiftAccountSchema).default([]),
  music: trimmed.default(""),
  sections: z.array(z.enum(SECTION_IDS)).default([...SECTION_IDS]),
  /** Khóa sửa: ai có khóa mới vào được trang chỉnh sửa */
  editKey: trimmed.min(8),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type Invitation = z.infer<typeof InvitationSchema>;
export type InvitationInput = z.input<typeof InvitationSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type WeddingEvent = z.infer<typeof EventSchema>;
export type GiftAccount = z.infer<typeof GiftAccountSchema>;

/** Dữ liệu công khai gửi về trình duyệt: không có editKey */
export type PublicInvitation = Omit<Invitation, "editKey">;

export function toPublic(inv: Invitation): PublicInvitation {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { editKey, ...rest } = inv;
  return rest;
}

export const WishSchema = z.object({
  id: trimmed.min(1),
  name: trimmed.min(1, "Nhập tên").max(80),
  message: trimmed.min(1, "Nhập lời chúc").max(1000),
  createdAt: z.string(),
});
export type Wish = z.infer<typeof WishSchema>;

export const WishInputSchema = WishSchema.pick({ name: true, message: true });

export const RsvpSchema = z.object({
  id: trimmed.min(1),
  name: trimmed.min(1, "Nhập họ tên").max(80),
  attending: z.boolean(),
  guests: z.number().int().min(1).max(20).default(1),
  side: z.enum(["groom", "bride"]).default("groom"),
  note: trimmed.max(500).default(""),
  createdAt: z.string(),
});
export type Rsvp = z.infer<typeof RsvpSchema>;

export const RsvpInputSchema = RsvpSchema.pick({ name: true, attending: true, guests: true, side: true, note: true });

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
