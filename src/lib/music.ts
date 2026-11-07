/**
 * Danh sách nhạc nền có sẵn để chọn nhanh trong trình chỉnh sửa.
 *
 * Vì bản quyền, repo KHÔNG kèm file nhạc. Chủ site tự đặt file MP3 (bản mình
 * có quyền dùng) vào thư mục `public/music/` đúng tên `file` bên dưới; bài nào
 * có file thì hiện trong menu chọn, chưa có thì mờ đi. Muốn thêm bài khác chỉ
 * cần thêm một dòng vào danh sách này và bỏ file tương ứng vào thư mục.
 */
export interface MusicPreset {
  id: string;
  title: string;
  artist: string;
  lang: "vi" | "en";
  /** tên file trong public/music */
  file: string;
}

export const MUSIC_PRESETS: MusicPreset[] = [
  // Tiếng Việt
  { id: "ngay-dau-tien", title: "Ngày đầu tiên", artist: "Đức Phúc", lang: "vi", file: "ngay-dau-tien.mp3" },
  { id: "50-nam-ve-sau", title: "50 năm về sau", artist: "", lang: "vi", file: "50-nam-ve-sau.mp3" },
  { id: "ben-tren-tang-thuong", title: "Bên trên tầng thượng", artist: "Trung Quân", lang: "vi", file: "ben-tren-tang-thuong.mp3" },
  { id: "co-dau", title: "Cô dâu", artist: "Hoài Lâm", lang: "vi", file: "co-dau.mp3" },
  { id: "thuong-em-la-dieu-anh-khong-the-ngo", title: "Thương em là điều anh không thể ngờ", artist: "Noo Phước Thịnh", lang: "vi", file: "thuong-em-la-dieu-anh-khong-the-ngo.mp3" },
  // Tiếng Anh (gợi ý, đều là bài quen thuộc trong tiệc cưới)
  { id: "perfect", title: "Perfect", artist: "Ed Sheeran", lang: "en", file: "perfect.mp3" },
  { id: "a-thousand-years", title: "A Thousand Years", artist: "Christina Perri", lang: "en", file: "a-thousand-years.mp3" },
  { id: "cant-help-falling-in-love", title: "Can't Help Falling in Love", artist: "Elvis Presley", lang: "en", file: "cant-help-falling-in-love.mp3" },
  { id: "all-of-me", title: "All of Me", artist: "John Legend", lang: "en", file: "all-of-me.mp3" },
  { id: "marry-you", title: "Marry You", artist: "Bruno Mars", lang: "en", file: "marry-you.mp3" },
  { id: "beautiful-in-white", title: "Beautiful in White", artist: "Westlife", lang: "en", file: "beautiful-in-white.mp3" },
  { id: "thinking-out-loud", title: "Thinking Out Loud", artist: "Ed Sheeran", lang: "en", file: "thinking-out-loud.mp3" },
];

export function presetUrl(p: MusicPreset): string {
  return `/music/${p.file}`;
}
