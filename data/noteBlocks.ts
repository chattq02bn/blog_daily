import type { Note, NoteBlock } from "./notes";

export type NoteBlocks = NoteBlock[];

/** Chuyển mảng đoạn văn thuần sang blocks paragraph cho editor */
export function bodyToBlocks(note: Note): NoteBlocks {
  if (note.blocks?.length) return note.blocks;
  return note.body.map(
    (paragraph): NoteBlock => ({
      type: "paragraph",
      content: paragraph,
    })
  );
}

const RICH_TOPICS = [
  ["chuẩn bị", "thực hiện", "lưu ý nhỏ"],
  ["bối cảnh", "điều bất ngờ", "bài học rút ra"],
  ["khởi đầu", "trải nghiệm", "kết quả"],
];

/** Sinh nội dung giàu định dạng (heading, list, quote, ảnh...) để demo editor view */
export function makeRichFakeBlocks(index: number): NoteBlocks {
  const [h1, h2, h3] = RICH_TOPICS[index % RICH_TOPICS.length];
  return [
    {
      type: "paragraph",
      content:
        "Bài viết này được tạo từ dữ liệu mẫu để demo trình soạn thảo ở chế độ xem. Bạn sẽ thấy đầy đủ các định dạng: tiêu đề mục, danh sách, trích dẫn và hình ảnh minh họa.",
    },
    { type: "heading", content: h1.charAt(0).toUpperCase() + h1.slice(1), props: { level: 2 } },
    {
      type: "paragraph",
      content: "Trước khi bắt đầu, hãy đảm bảo bạn đã chuẩn bị đủ những điều kiện cơ bản dưới đây:",
    },
    { type: "bulletListItem", content: "Dành ra 15–30 phút yên tĩnh mỗi ngày" },
    { type: "bulletListItem", content: "Ghi lại mục tiêu rõ ràng, đo lường được" },
    { type: "bulletListItem", content: "Chọn nhịp độ phù hợp với lịch riêng của bạn" },
    {
      type: "image",
      props: {
        url: `https://picsum.photos/seed/rich-${index}-a/900/480`,
        caption: "Hình minh họa cho phần chuẩn bị",
      },
    },
    { type: "heading", content: h2.charAt(0).toUpperCase() + h2.slice(1), props: { level: 2 } },
    {
      type: "numberedListItem",
      content: "Bắt đầu với bước nhỏ nhất có thể để tạo đà",
    },
    {
      type: "numberedListItem",
      content: "Duy trì đều đặn liên tục trong ít nhất một tuần",
    },
    {
      type: "numberedListItem",
      content: "Ghi nhận cảm nhận và điều chỉnh linh hoạt",
    },
    {
      type: "paragraph",
      content:
        "Cách làm từng bước như trên không đòi hỏi kỹ năng đặc biệt — chỉ cần bạn kiên trì vài ngày đầu.",
    },
    { type: "heading", content: h3.charAt(0).toUpperCase() + h3.slice(1), props: { level: 2 } },
    {
      type: "quote",
      content:
        "Điều quan trọng không phải làm hoàn hảo ngay từ đầu, mà là bắt đầu và giữ được nhịp.",
    },
    {
      type: "paragraph",
      content:
        "Sau một tuần áp dụng, bạn sẽ thấy khác biệt rõ rệt về cảm giác chủ động. Hãy thử và chia sẻ kết quả của bạn nhé!",
    },
    {
      type: "image",
      props: {
        url: `https://picsum.photos/seed/rich-${index}-b/900/480`,
        caption: "Kết quả sau một tuần duy trì",
      },
    },
  ];
}
