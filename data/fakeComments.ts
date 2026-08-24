import {
  EMOJIS,
  Comment as CommentType,
  CommentEmoji,
} from "@/lib/commentStorage";

const noEmojis = () => ({}) as Record<CommentEmoji, number>;
const noReactions = () => ({}) as Record<CommentEmoji, boolean>;

export function seedFakeComments(noteId: string) {
  const stored = localStorage.getItem("note_comments");
  const all = stored ? JSON.parse(stored) : [];
  const existing = all.filter((c: CommentType) => c.noteId === noteId);
  if (existing.length > 0) return;

  const fakeComments: CommentType[] = [
    {
      id: "fake_1",
      noteId,
      parentId: null,
      author: "Minh Anh",
      authorAvatar: "https://i.pravatar.cc/96?img=1",
      content: "Bài viết rất hay và hữu ích! Cảm ơn bạn đã chia sẻ.",
      emojis: noEmojis(),
      userReactions: noReactions(),
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      isEdited: false,
    },
    {
      id: "fake_2",
      noteId,
      parentId: "fake_1",
      author: "Tuấn Minh",
      authorAvatar: "https://i.pravatar.cc/96?img=3",
      content: "Đồng ý với bạn! Mình cũng rất thích phần này.",
      emojis: noEmojis(),
      userReactions: noReactions(),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      isEdited: false,
    },
    {
      id: "fake_3",
      noteId,
      parentId: null,
      author: "Hoàng Hà",
      authorAvatar: "https://i.pravatar.cc/96?img=5",
      content: "Mình muốn tìm hiểu thêm về chủ đề này. Bạn có thể viết thêm được không?",
      emojis: noEmojis(),
      userReactions: noReactions(),
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      isEdited: false,
    },
    {
      id: "fake_4",
      noteId,
      parentId: null,
      author: "Thu Trang",
      authorAvatar: "https://i.pravatar.cc/96?img=9",
      content: "Cảm ơn tác giả đã đúc kết những kinh nghiệm quý báu!",
      emojis: noEmojis(),
      userReactions: noReactions(),
      createdAt: new Date(Date.now() - 900000).toISOString(),
      updatedAt: new Date(Date.now() - 900000).toISOString(),
      isEdited: false,
    },
    ...[
      ["fake_5", null, "Gia Hưng", 47, "Chờ phần tiếp theo của bài này quá!"],
      ["fake_6", "fake_5", "Bảo Ngọc", 44, "Mình cũng đang mong phần 2 nè."],
      ["fake_7", null, "Đức Anh", 40, "Lưu lại đọc dần, bài rất chất lượng."],
      ["fake_8", null, "Hải Yến", 35, "Hình ảnh minh họa đẹp quá trời."],
      ["fake_9", "fake_8", "Quang Linh", 30, "Đúng vậy, nhìn đã mắt luôn."],
      ["fake_10", null, "Thanh Hà", 26, "Áp dụng ngay cho tuần này thôi!"],
      ["fake_11", null, "Minh Quân", 20, "Có ai biết tài liệu nào liên quan không ạ?"],
      ["fake_12", "fake_11", "Khánh Vy", 16, "Bạn tham khảo thêm ở phần tag cuối bài nhé."],
      ["fake_13", null, "Tuấn Kiệt", 12, "Đọc xong động lực tăng hẳn luôn."],
      ["fake_14", null, "Ngọc Mai", 8, "Cảm ơn bạn nhiều nhé!"],
      // Chuỗi 3 cấp: fake_1 (ông) → fake_2 (cha) → fake_15 (cháu)
      ["fake_15", "fake_2", "Chí Thanh", 50, "Hai bác nói đúng quá, mình cũng thấy vậy!"],
      // Chuỗi 3 cấp: fake_5 → fake_6 → fake_16
      ["fake_16", "fake_6", "Hoài Nam", 42, "Phần 2 chắc chắn có, tác giả bảo rồi mà."],
      // Cấp 4 sẽ được gộp vào cấp cháu của thread fake_5
      ["fake_17", "fake_16", "Kim Ngân", 38, "Vậy chờ bản cập nhật thôi mọi người ơi!"],
      ["fake_18", "fake_12", "Trọng Tín", 14, "Cảm ơn bạn, để mình xem thử nhé."],
      ["fake_19", null, "Ánh Dương", 6, "Bài viết đỉnh thật sự, chia sẻ ngay cho hội bạn thân!"],
      ["fake_20", null, " Quốc Bảo", 4, "Đây chính là thứ mình đang tìm kiếm bấy lâu."],
      ["fake_21", null, "Mỹ Duyên", 3, "Màu sắc và layout bài này dễ thương quá!"],
      ["fake_22", "fake_21", "Hữu Phước", 2, "Tác giả phối màu theo tông pastel đó bạn."],
      ["fake_23", null, "Bảo Trâm", 1, "Like mạnh cho tác giả nào!"],
    ].map(([id, parentId, author, minutesAgo, content]) => ({
      id: id as string,
      noteId,
      parentId: parentId as string | null,
      author: author as string,
      authorAvatar: `https://i.pravatar.cc/96?img=${(Number(minutesAgo) % 70) + 2}`,
      content: content as string,
      emojis: noEmojis(),
      userReactions: noReactions(),
      createdAt: new Date(Date.now() - Number(minutesAgo) * 60000).toISOString(),
      updatedAt: new Date(Date.now() - Number(minutesAgo) * 60000).toISOString(),
      isEdited: false,
    })),
  ];

  const initialEmojis = {} as Record<CommentEmoji, number>;
  const initialReactions = {} as Record<CommentEmoji, boolean>;
  EMOJIS.forEach((e) => {
    initialEmojis[e] = 0;
    initialReactions[e] = false;
  });

  const seedLikes: Record<string, number> = {
    fake_1: 24,
    fake_2: 8,
    fake_3: 15,
    fake_4: 3,
    fake_5: 11,
    fake_6: 5,
    fake_7: 6,
    fake_8: 9,
    fake_10: 4,
    fake_12: 2,
    fake_15: 7,
    fake_19: 13,
    fake_21: 6,
    fake_23: 18,
  };

  fakeComments.forEach((c) => {
    c.emojis = { ...initialEmojis, "❤️": seedLikes[c.id] || 0 };
    c.userReactions = { ...initialReactions };
  });

  all.push(...fakeComments);
  localStorage.setItem("note_comments", JSON.stringify(all));
}
