import type { Block } from "@blocknote/core";

/*
 * Dữ liệu giả cho topic "Review sản phẩm".
 * Body là mảng BlockNote block — dùng chung schema của admin Editor
 * (gồm cả block custom productCard).
 */

const t = (text: string, styles: Record<string, unknown> = {}) => ({
  type: "text",
  text,
  styles,
});

export const reviewProductBody = [
  {
    type: "paragraph",
    content: [
      t("Sau "),
      t("30 ngày sử dụng liên tục mỗi ngày", { bold: true }),
      t(
        ", mình đã đủ trải nghiệm — từ xay đá viên đến làm smoothie cho cả nhà — để viết một bài đánh giá thật lòng về chiếc máy xay sinh tố Philips HR2223/90. Bài review này KHÔNG được tài trợ, máy mình tự bỏ tiền mua với giá khoảng 1.6 triệu tại thời điểm đầu năm.",
      ),
    ],
  },
  {
    type: "paragraph",
    content:
      "Nếu bạn đang phân vân giữa hàng loạt mẫu máy xay trong tầm giá 1–2 triệu thì bài viết này dành cho bạn. Chúng ta sẽ đi qua từng khía cạnh: thiết kế, hiệu năng, độ ồn, độ bền và cả những điểm mà quảng cáo không bao giờ nói.",
  },

  {
    type: "heading",
    props: { level: 2 },
    content: "1. Thông số kỹ thuật nhanh",
  },
  {
    type: "bulletListItem",
    content: [
      t("Công suất: ", { bold: true }),
      t("800W — mức phổ biến cho gia đình 4 người"),
    ],
  },
  {
    type: "bulletListItem",
    content: [
      t("Dung tích bình: ", { bold: true }),
      t("2 lít (thể tích hữu ích khoảng 1.5 lít)"),
    ],
  },
  {
    type: "bulletListItem",
    content: [
      t("Lưỡi dao: ", { bold: true }),
      t('thép không gỉ 6 cánh "S" — quảng cáo là công nghệ ProBlend 6'),
    ],
  },
  {
    type: "bulletListItem",
    content: [
      t("Chế độ: ", { bold: true }),
      t("5 tốc độ cơ khí + nút Pulse + nút Ice Crush chuyên đá"),
    ],
  },
  {
    type: "bulletListItem",
    content: [
      t("Bảo hành: ", { bold: true }),
      t("24 tháng chính hãng, 1 đổi 1 trong 6 tháng đầu"),
    ],
  },

  {
    type: "heading",
    props: { level: 2 },
    content: "2. Thiết kế & hoàn thiện",
  },
  {
    type: "paragraph",
    content:
      "Vỏ máy làm từ nhựa ABS sơn tĩnh điện màu đen, các đường cắt gọn gàng, không bị gờ thừa. Phần đế có 4 chân cao su chống trượt tốt — mình thử chạy ở tốc độ tối đa trên mặt đá granite, máy gần như không di chuyển và không kêu lạch cạch.",
  },
  {
    type: "paragraph",
    content:
      "Bình xay bằng nhựa PETG trong suốt, nhìn xuyên thấu được nguyên liệu bên trong. Điểm cộng lớn là nắp đậy có khoang chứa sẵn 2 miếng silicon chống rò rỉ, và cổng đổ thêm nguyên liệu ở giữa nắp rộng đủ để nhét cả quả chuối vừa phải vào khi máy đang quay (dĩ nhiên là nên dừng máy trước).",
  },
  {
    type: "paragraph",
    content:
      "Trọng lượng toàn bộ 3.2kg — đủ nặng để chắc chân nhưng vẫn nhấc một tay thoải mái. Dây nguồn quấn gọn dưới đế, chiều dài 1m hơi ngắn nếu ổ điện của bạn để xa mép bếp.",
  },

  {
    type: "heading",
    props: { level: 2 },
    content: "3. Đánh giá hiệu năng thực tế",
  },
  {
    type: "paragraph",
    content:
      "Mình đã tự làm 5 bài thử nghiệm tại nhà, mỗi bài lặp lại 3 lần để lấy kết quả trung bình:",
  },
  {
    type: "numberedListItem",
    content: [
      t("Xay đá viên: ", { bold: true }),
      t("200g đá trong chế độ Ice Crush, 25 giây ra đá mịn kiểu quán bar — điểm 9/10"),
    ],
  },
  {
    type: "numberedListItem",
    content: [
      t("Rau củ đông lạnh: ", { bold: true }),
      t("xay mượt trong 40 giây, không còn hạt vụn lớn — điểm 8.5/10"),
    ],
  },
  {
    type: "numberedListItem",
    content: [
      t("Smoothie chuối – yến mạch – sữa tươi: ", { bold: true }),
      t("kết cấu mịn màng, không tách nước sau 15 phút để yên — điểm 9/10"),
    ],
  },
  {
    type: "numberedListItem",
    content: [
      t("Súp nóng: ", { bold: true }),
      t("NHÀ SẢN XUẤT KHÔNG KHUYẾN NGHỊ xay chất lỏng nóng, nắp dễ bị đẩy bật — bạn nên để nguội rồi mới xay"),
    ],
  },
  {
    type: "numberedListItem",
    content: [
      t("Gia vị khô (ớt, tiêu): ", { bold: true }),
      t("cần mua riêng bình xay khô, bình ướt xay gia vị sẽ ám mùi sang các lần smoothie sau"),
    ],
  },

  {
    type: "productCard",
    props: {
      title: "Máy xay sinh tố Philips HR2223/90",
      description:
        "Công suất 800W, bình 2L, lưỡi dao 6 cánh thép không gỉ, chế độ Ice Crush chuyên đá viên. Hàng chính hãng bảo hành 24 tháng.",
      imageUrl:
        "https://images.unsplash.com/photo-1570222094114-d054a817e56b",
      buttonText: "Mua ngay",
      buttonUrl: "#",
    },
  },

  {
    type: "heading",
    props: { level: 2 },
    content: "4. Độ ồn: có êm như quảng cáo?",
  },
  {
    type: "paragraph",
    content:
      "Quảng cáo nói \"độ ồn giảm 20%\" — thực tế mình đo bằng app trên điện thoại đặt cách máy 30cm: mức tối đa đạt khoảng 82dB, tương đương máy hút bụi cầm tay. Chế độ Ice Crush thậm chí nhích lên 85dB trong vài giây đầu. Nói cách khác: KHÔNG êm, chỉ là ồn ở mức chấp nhận được cho một máy 800W. Nếu bạn sống trong chung cư mini, đừng xay sau 10 giờ đêm.",
  },

  {
    type: "heading",
    props: { level: 2 },
    content: "5. Vệ sinh sau khi dùng",
  },
  {
    type: "bulletListItem",
    content:
      "Chế độ tự làm sạch: đổ 400ml nước ấm + 1 giọt nước rửa chén, bấm Pulse 30 giây là sạch khoảng 80%",
  },
  {
    type: "bulletListItem",
    content:
      "Lưỡi dao tháo khỏi bình chỉ bằng một vòng xoay — rửa trực tiếp dưới vòi rất tiện",
  },
  {
    type: "bulletListItem",
    content:
      "Điểm trừ duy nhất: gioăng cao su quanh trục dao cần tháo ra lau khô riêng, nếu bỏ quên ẩm sẽ có mùi hôi sau 1–2 tuần",
  },
  {
    type: "quote",
    content: [
      t(
        "Nếu ngân sách cho phép, chênh lệch 250 nghìn đồng so với Panasonic là khoản đầu tư xứng đáng cho sức khỏe gia đình bạn mỗi sáng.",
      ),
    ],
  },

  {
    type: "heading",
    props: { level: 2 },
    content: "7. Ai nên mua, ai nên bỏ qua?",
  },
  {
    type: "paragraph",
    content: [t("Nên mua nếu bạn:", { bold: true })],
  },
  {
    type: "bulletListItem",
    content: "Thường xuyên làm smoothie, sữa hạt cho gia đình từ 3 người trở lên",
  },
  {
    type: "bulletListItem",
    content: "Cần máy xay đá tốt để pha chế đồ uống tại nhà cuối tuần",
  },
  {
    type: "bulletListItem",
    content: "Muốn thương hiệu lớn, hệ thống bảo hành dễ kiếm phụ kiện thay thế",
  },
  {
    type: "paragraph",
    content: [t("Nên bỏ qua nếu bạn:", { bold: true })],
  },
  {
    type: "bulletListItem",
    content: "Chỉ xay gia vị khô — hãy mua bộ bình xay khô chuyên dụng rẻ hơn nhiều",
  },
  {
    type: "bulletListItem",
    content: "Có nhu cầu nghiền bột mịn như quán cà phê — cần máy công nghiệp từ 1500W trở lên",
  },

  {
    type: "heading",
    props: { level: 2 },
    content: "8. Mẹo dùng máy bền hơn 5 năm",
  },
  {
    type: "numberedListItem",
    content:
      "Không vận hành liên tục quá 60 giây — nghỉ 20 giây giữa các mẻ để motor nguội",
  },
  {
    type: "numberedListItem",
    content:
      "Luôn cho chất lỏng vào trước, nguyên liệu đặc vào sau để lưỡi dao không bị kẹt",
  },
  {
    type: "numberedListItem",
    content: "Không đổ chất lỏng nóng trên 60°C vào bình nhựa PETG",
  },
  {
    type: "numberedListItem",
    content:
      "Tháo gioăng cao su phơi khô sau mỗi lần rửa, tránh nấm mốc phát triển",
  },

  {
    type: "productCard",
    props: {
      title: "Bình xay khô thay thế cho Philips HR2223",
      description:
        "Bình 0.5L chuyên xay gia vị, cà phê, ngũ cốc khô. Lưỡi dao 2 cánh thép 304, tương thích 100% với đế máy HR2223.",
      imageUrl:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b",
      buttonText: "Xem giá",
      buttonUrl: "#",
    },
  },

  {
    type: "heading",
    props: { level: 2 },
    content: "Kết luận: Có đáng mua không?",
  },
  {
    type: "paragraph",
    content: [
      t("Điểm tổng kết của mình: ", {}),
      t("8.5/10", { bold: true }),
      t(
        ". Philips HR2223/90 là lựa chọn an toàn nhất trong tầm giá 1.5–1.8 triệu hiện nay: hiệu năng xay đá thuộc top đầu phân khúc, vệ sinh dễ dàng, phụ kiện thay thế đầy đủ. Điểm trừ lớn nhất là độ ồn và không hỗ trợ xay nóng.",
      ),
    ],
  },
  {
    type: "paragraph",
    content:
      "Nếu bạn thấy bài review hữu ích, đừng quên lưu lại và theo dõi topic Review sản phẩm để cập nhật các bài đánh giá tiếp theo nhé!",
  },
] as unknown as Block[];

export const reviewProductPostId = "p9";

export const reviewProductSeed = {
  id: reviewProductPostId,
  title: "Review chi tiết máy xay sinh tố Philips HR2223/90 sau 30 ngày sử dụng",
  topicIds: ["t9"],
  tagIds: ["tag9", "tag3"],
  cover: "https://picsum.photos/seed/review-san-pham/1200/630",
  status: "published" as const,
  bodyBlocks: reviewProductBody,
};
