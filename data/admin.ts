export interface AdminTopic {
  id: string;
  name: string;
  description: string;
}

export const adminTopics: AdminTopic[] = [
  { id: "t1", name: "Mẹo sống xanh", description: "Chia sẻ các mẹo bảo vệ môi trường, sống xanh mỗi ngày." },
  { id: "t2", name: "Cà phê nhà", description: "Phương pháp pha cà phê tại nhà ngon như quán." },
  { id: "t3", name: "Chuyện nhà tôi", description: "Những câu chuyện đời thường trong gia đình." },
  { id: "t4", name: "Công thức cuối tuần", description: "Công thức món ăn cho bữa cuối tuần." },
  { id: "t5", name: "Sống chậm", description: "Lối sống chậm rãi, tận hưởng từng khoảnh khắc." },
  { id: "t6", name: "Sống một mình", description: "Kinh nghiệm sống độc lập cho người trẻ." },
  { id: "t7", name: "Ăn vặt văn phòng", description: "Đồ ăn vặt phù hợp cho dân công sở." },
  { id: "t8", name: "Mẹo tiết kiệm", description: "Cách quản lý chi tiêu và tiết kiệm hiệu quả." },
  { id: "t9", name: "Review sản phẩm", description: "Đánh giá chi tiết, trung thực các sản phẩm sau khi sử dụng thực tế." },
];

export interface AdminTag {
  id: string;
  name: string;
}

export const adminTags: AdminTag[] = [
  { id: "tag1", name: "tản văn" },
  { id: "tag2", name: "cảm xúc" },
  { id: "tag3", name: "mẹo hay" },
  { id: "tag4", name: "công thức" },
  { id: "tag5", name: "chia sẻ" },
  { id: "tag6", name: "kỹ năng" },
  { id: "tag7", name: "du lịch" },
  { id: "tag8", name: "sức khỏe" },
  { id: "tag9", name: "review" },
];