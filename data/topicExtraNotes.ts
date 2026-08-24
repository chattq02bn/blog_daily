import type { Note } from "./notes";
import { makeRichFakeBlocks } from "./noteBlocks";

const FAKE_AUTHORS = [
  "Bầu trời xanh",
  "Giọt sương sớm",
  "Người đi bộ",
  "Gọn gàng xinh",
  "Viện cà phê nhà",
  "Chiều thứ bảy",
];

export function makeFakeNotes(sectionId: string, count = 4): Note[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = `${sectionId}-extra-${i + 1}`;
    return {
      id: seed,
      title: `Gợi ý nhỏ cho ngày bận rộn #${i + 1}: mẹo áp dụng được ngay từ hôm nay`,
      excerpt: `Chuyện nhỏ mà có võ từ chủ đề ${sectionId}. Chỉ vài phút mỗi ngày nhưng thay đổi rõ rệt sau một tuần.`,
      cover: `https://picsum.photos/seed/${seed}/1280/670`,
      author: FAKE_AUTHORS[i % FAKE_AUTHORS.length],
      avatar: `https://picsum.photos/seed/${seed}-avatar/96/96`,
      likes: 120 + ((i * 137) % 800),
      comments: 5 + ((i * 23) % 60),
      bookmark: 30 + ((i * 71) % 300),
      date: `2026-08-${String(20 - i).padStart(2, "0")}`,
      tags: ["đời sống", sectionId],
      body: [
        "Đây là bài viết mẫu cho màn chi tiết topic. Nội dung được sinh tự động để demo giao diện.",
        "Bạn có thể thay thế bằng dữ liệu thật từ API sau này.",
        "Mỗi bài viết đều có ảnh bìa, tác giả và số liệu tương tác riêng để card trông sống động hơn.",
      ],
      blocks: makeRichFakeBlocks(i),
    };
  });
}
