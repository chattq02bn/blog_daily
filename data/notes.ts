export type NoteBlock = {
  type: string;
  props?: Record<string, unknown>;
  content?: unknown;
};

export type Note = {
  id: string;
  title: string;
  excerpt: string;
  cover: string;
  author: string;
  avatar: string;
  likes: number;
  comments: number;
  bookmark: number;
  date: string;
  tags: string[];
  body: string[];
  /** Nội dung dạng khối cho editor xem-chi-tiết; nếu bỏ trống sẽ suy ra từ body */
  blocks?: NoteBlock[];
};

export type Topic = {
  slug: string;
  name: string;
  emoji?: string;
  description?: string;
};

export type TopicSection = {
  id: string;
  title: string;
  description: string;
  href: string;
  notes: Note[];
};

export const trendingTags = [
  { rank: 1, name: "Mẹo sống xanh", href: "/tag/meo-song-xanh" },
  { rank: 2, name: "Cà phê nhà", href: "/tag/ca-phe-nha" },
  { rank: 3, name: "Chuyện nhà tôi", href: "/tag/chuyen-nha-toi" },
  { rank: 4, name: "Công thức cuối tuần", href: "/tag/cong-thuc-cuoi-tuan" },
  { rank: 5, name: "Sống chậm", href: "/tag/song-cham" },
];

export const topics = [
  {
    title: "Thử thách",
    href: "/topic/challenge",
    children: [
      "Sống một mình",
      "Cà phê tại nhà",
      "Ăn vặt văn phòng",
      "Suối nước nóng trong ngày",
      "Buổi sáng năng động",
      "Tự nấu cơm hộp",
      "Đi bộ 10.000 bước",
      "Nhật ký không tiền",
      "Thử thách đọc sách",
      "Dọn nhà tối giản",
      "Học một kỹ năng mới",
      "Ngủ đúng 23h",
      "Uống đủ 2 lít nước",
    ],
  },
  {
    title: "Tài chính",
    href: "/topic/money",
    children: [
      "Việc làm thêm",
      "Quỹ đầu tư",
      "Đóng thuế quê hương",
      "Mẹo tiết kiệm",
      "Tận dụng điểm thưởng",
    ],
  },
  {
    title: "Đời sống",
    href: "/topic/life",
    children: [
      "Nuôi dạy con",
      "Ý tưởng sống",
      "Mẹo dọn nhà",
      "Sắp xếp gọn gàng",
      "Sống cùng chó cưng",
    ],
  },
  {
    title: "Học tập",
    href: "/topic/study",
    children: [
      "Học chứng chỉ",
      "Học tiếng Anh",
      "Lập trình",
      "Cảm nhận sách",
      "Chánh niệm",
    ],
  },
  {
    title: "Công nghệ",
    href: "/topic/tech",
    children: [
      "AI tạo sinh",
      "Phát triển web",
      "Ứng dụng di động",
      "Tiện ích công nghệ",
      "Phân tích dữ liệu",
    ],
  },
];

export const sidebarFooterLinks = [
  { label: "Cách dùng note", href: "https://www.help-note.com/hc/ja" },
  { label: "Công ty vận hành", href: "https://note.jp/" },
  { label: "Tuyển dụng", href: "https://note.jp/n/nc0fe1a230633" },
  { label: "Doanh nghiệp sử dụng", href: "https://note.com/topic/noteprolist" },
];

const note = (seed: string, overrides: Partial<Note>): Note => ({
  id: seed,
  title: "",
  excerpt: "",
  cover: `https://picsum.photos/seed/${seed}/1280/670`,
  author: "",
  avatar: `https://picsum.photos/seed/${seed}-avatar/96/96`,
  likes: 0,
  comments: 0,
  bookmark: 0,
  date: "",
  tags: [],
  body: [],
  ...overrides,
});

export const notes: Note[] = [
  note("n1", {
    title: "\u201CViết\u201D là cách tôi lớn lên từ từ. 3 năm nhìn lại cách tôi ở bên note",
    excerpt:
      "Mỗi ngày viết thì khó, nhưng viết khi cảm hứng đến thì có thể duy trì. Những gì 3 năm ghi chép đã cho tôi thấy về thói quen \u201Cviết\u201D của riêng mình.",
    author: "Bầu trời xanh",
    likes: 482,
    comments: 23,
    bookmark: 156,
    date: "2026-08-17",
    tags: ["tản văn", "kỹ năng viết", "thói quen"],
    body: [
      "Tôi bắt đầu dùng note đã gần 3 năm. Lúc đầu tự ép bản thân \u201Cphải đăng mỗi ngày\u201D, nên chỉ hai tuần đã kiệt sức.",
      "Giờ thì khác. Viết khi muốn viết, không muốn thì đọc. Cứ lỏng tay như vậy, chớp mắt đã gom được hơn 100 bài viết.",
      "\u201CViết\u201D là cách nuôi dưỡng tôi từ từ. Không vội, có nghỉ, nhưng vẫn tiếp tục — đó mới là điều quan trọng.",
    ],
  }),
  note("n2", {
    title: "【Lưu trữ】Cách chọn đồ ăn vặt văn phòng cho người mới. 5 điểm để không hối hận",
    excerpt:
      "3 giờ chiều khi sự tập trung đứt quãng. Cách chọn \u201Cđồ ăn vặt văn phòng\u201D đáng tin cậy, được đàn anh đàn chị bí mật chỉ điểm.",
    author: "Aoi phụ trách ăn vặt",
    likes: 1247,
    comments: 89,
    bookmark: 523,
    date: "2026-08-16",
    tags: ["ăn vặt văn phòng", "đồ ăn vặt", "bí quyết công việc"],
    body: [
      "Buổi chiều mất tập trung không chỉ vì đường huyết. Cứ lặp đi lặp lại cùng một việc, não bộ sẽ chán.",
      "Chính vì vậy, giờ ăn vặt nên nhằm mục đích \u201Cnạp lại tinh thần\u201D. Điểm mấu chốt: chọn món ăn được ngay, hơn là món phải qua nhiều thao tác.",
      "Lần này, tôi — người 3 năm nghiên cứu đồ ăn vặt văn phòng — sẽ giới thiệu 5 điểm để bạn không phải hối hận.",
    ],
  }),
  note("n3", {
    title: "Năm thứ 2 dậy sớm. 5 giờ sáng đã dạy tôi về \u201Cmật độ\u201D của thời gian",
    excerpt:
      "Người ta nói \u201Cdậy sớm thì có lợi\u201D. Nhưng 2 năm dậy sớm dạy tôi rằng thứ quan trọng không phải độ dài, mà là \u201Cmật độ\u201D của thời gian.",
    author: "Giọt sương sớm",
    likes: 315,
    comments: 41,
    bookmark: 98,
    date: "2026-08-15",
    tags: ["dậy sớm", "tạo thói quen", "bí quyết sống"],
    body: [
      "Sống dậy lúc 5 giờ sáng đã được 2 năm. Tháng đầu khổ sở, tôi bao lần nghĩ đến chuyện bỏ cuộc.",
      "Nhưng rồi có lúc tôi nhận ra: 2 giờ sáng ngày khác hoàn toàn 2 giờ tối về \u201Cmật độ\u201D. Là khoảng thời gian không ai quấy rầy, chỉ dành riêng cho mình.",
      "Không phải độ dài, mà là mật độ. Đó là điều giản đơn mà dậy sớm đã dạy tôi.",
    ],
  }),
  note("n4", {
    title: "Sinh viên năm nhất sống một mình áp dụng \u201Cquản lý chi tiêu không gò ép\u201D",
    excerpt:
      "Tiết kiệm thường chết yểu sau ba ngày. Vì vậy, việc tạo ra cơ chế không áp lực mới quan trọng. Công bố sổ chi tiêu thực tế của năm đầu đi làm.",
    author: "Maruko",
    likes: 863,
    comments: 67,
    bookmark: 341,
    date: "2026-08-14",
    tags: ["sống một mình", "quản lý chi tiêu", "tiết kiệm"],
    body: [
      "Sống một mình được 1 năm. Loay hoay không để ra được đồng nào, câu trả lời tôi tìm được là \u201Cđừng tiết kiệm quá sức\u201D.",
      "Ép tiết kiệm sẽ không bền. Thay vì cắt hẳn ăn ngoài, mỗi tháng vẫn thưởng cho mình 2 lần. Bù lại, rà soát chi phí cố định.",
      "Với cách này, tôi đã để ra được 3 triệu mỗi tháng mà không thấy khổ.",
    ],
  }),
  note("n5", {
    title: "Hợp hơn cả ChatGPT? Cách dựng môi trường LLM cục bộ trong 1 giờ",
    excerpt:
      "Dành cho những ai không muốn đưa dữ liệu lên đám mây. Hướng dẫn chạy LLM mã nguồn mở ngay trên PC của bạn, kèm ảnh chụp màn hình.",
    author: "Dev Naoki",
    likes: 2341,
    comments: 156,
    bookmark: 1204,
    date: "2026-08-13",
    tags: ["AI tạo sinh", "LLM", "lập trình"],
    body: [
      "Sức hút của LLM cục bộ nằm ở quyền riêng tư và chi phí. API đám mây tiện, nhưng nhiều người lo dữ liệu bị đưa ra ngoài.",
      "Lần này giới thiệu cách chạy mô hình mã nguồn mở trên máy của bạn. Dựng môi trường mất khoảng 1 giờ.",
      "Từ các bước cài đặt, so sánh tốc độ suy luận, đến cách chọn mô hình phù hợp — tôi sẽ giải thích tất tần tật.",
    ],
  }),
  note("n6", {
    title: "Cuối tuần một mình đi suối nước nóng. 10 cách tận hưởng suối nước nóng trong ngày",
    excerpt:
      "Cuối tuần không kế hoạch, gần đây tôi mê suối nước nóng trong ngày. Truyền đạt tuyệt chiêu vòng lặp vàng xông hơi → ngâm nước lạnh → hóng gió ngoài trời.",
    author: "Ngày tắm nóng",
    likes: 1894,
    comments: 123,
    bookmark: 876,
    date: "2026-08-12",
    tags: ["suối nước nóng trong ngày", "xông hơi", "thời gian một mình"],
    body: [
      "Cuối tuần, nhất là những ngày không có kế hoạch, đi suối nước nóng trong ngày đã thành thú vui gần đây của tôi. Gần ga, nước khoáng tốt, đồ ăn ngon. Chỉ vậy thôi đã đủ hạnh phúc.",
      "Xông hơi 10 phút, ngâm nước lạnh 1 phút, hóng gió 5 phút. Lặp lại vòng lặp vàng này 3 lượt, đầu óc trắng xóa, căng thẳng ngày thường tan dần.",
      "Khoảng thời gian xa xỉ chỉ có được khi đi một mình. Hãy thử nhé.",
    ],
  }),
  note("n7", {
    title: "3 tháng đầu tư quỹ. Bài học từ thất bại khi \u201Ctích lũy định kỳ\u201D",
    excerpt:
      "Ban đầu sợ hãi nên chỉ bắt đầu từ 10 triệu. Điều 3 tháng vận hành dạy tôi là \u201Ckiên trì\u201D chính là vũ khí lớn nhất.",
    author: "Hiroko tích lũy",
    likes: 678,
    comments: 54,
    bookmark: 289,
    date: "2026-08-11",
    tags: ["quỹ đầu tư", "tích lũy định kỳ", "tài chính"],
    body: [
      "Tích lũy quỹ đầu tư định kỳ đã được 3 tháng. Tháng đầu ngày nào tôi cũng soi giá rồi vui buồn thất thường.",
      "Đúng lúc đó, một cuốn sách viết \u201Cđã đầu tư thì tốt nhất đừng nhìn\u201D. Quả thật, kể từ đó tôi giảm hẳn số lần mở ứng dụng.",
      "Cuối cùng, tích lũy có kiên trì là trên hết. Mở tài khoản xong, cứ để nó tự chạy là xong.",
    ],
  }),
  note("n8", {
    title: "Cách viết cảm nhận sách, bản đầy đủ. Từ \u201Cđọc\u201D sách đến \u201Ckể chuyện\u201D về sách",
    excerpt:
      "Cảm nhận sách chỉ dừng ở \u201Chay quá\u201D. Cách ghi chú có cấu trúc và khuôn mẫu sẽ thay đổi hoàn toàn chất lượng bài viết.",
    author: "Cánh cửa sách",
    likes: 542,
    comments: 38,
    bookmark: 415,
    date: "2026-08-10",
    tags: ["đọc sách", "cảm nhận sách", "học tập"],
    body: [
      "Người viết cảm nhận sách kém thường nghĩ \u201Cphải viết hết nội dung cuốn sách\u201D. Đó chính là sai lầm lớn nhất.",
      "Cảm nhận sách không cần tóm tắt, mà cần ghi lại \u201Cbạn đã thay đổi thế nào\u201D. Viết theo 3 khuôn mẫu, bài viết sẽ dễ đọc đến bất ngờ.",
      "Bài viết này công khai hoàn toàn cách ghi chú tôi đang áp dụng và khuôn mẫu viết cảm nhận.",
    ],
  }),
  note("n9", {
    title: "Lời khuyên về cà phê tại nhà. Từ cách pha đến cách tạo không gian",
    excerpt:
      "Cách tiết kiệm 2 triệu tiền cà phê mỗi tháng. Tất cả về máy móc, chọn hạt và cách pha để thưởng thức cà phê đẳng cấp ngay tại nhà.",
    author: "Viện nghiên cứu cà phê nhà",
    likes: 3211,
    comments: 234,
    bookmark: 1567,
    date: "2026-08-09",
    tags: ["cà phê nhà", "cà phê", "đời sống"],
    body: [
      "Cà phê ngoài quán thì không khí tuyệt nhất, nhưng ngày nào cũng đi thì thoải mái vượt 2 triệu một tháng. Và tôi tìm đến \u201Ccà phê tại nhà\u201D.",
      "Cần chuẩn bị bộ lọc phin, bình rót và loại hạt mình thích. Chi phí mỗi ly khoảng vài chục nghìn.",
      "Độ xay hạt, nhiệt độ nước, cách rót. Chỉ cần một chút mẹo, vị cà phê như ngoài quán có thể tái hiện ngay tại nhà.",
    ],
  }),
  note("n10", {
    title: "Lộ trình học tập giúp người mới học lập trình không \u201Cbỏ cuộc\u201D",
    excerpt:
      "Đúc kết từ 3 lần tự học bỏ cuộc, kế hoạch học tập có thể duy trì. Từ chọn ngôn ngữ đến sản phẩm đầu tay.",
    author: "Mako lập trình",
    likes: 2987,
    comments: 198,
    bookmark: 1876,
    date: "2026-08-08",
    tags: ["lập trình", "tự học", "sự nghiệp"],
    body: [
      "Tôi từng tự học lập trình và bỏ cuộc 3 lần. Lần thứ 4 mới duy trì được, và giờ tôi làm kỹ sư web.",
      "Nguyên nhân bỏ cuộc hầu hết là \u201Clên kế hoạch quá nhiều\u201D và \u201Ckhông chịu thực hành\u201D.",
      "Bài viết này giới thiệu lộ trình học tập bắt đầu nhỏ và chắc chắn duy trì được, dựa trên kinh nghiệm thực tế.",
    ],
  }),
];

import { lifestyleNotes } from "./lifestyle";

export const getNoteById = (id: string): Note | undefined =>
  notes.find((n) => n.id === id) ?? lifestyleNotes.find((n) => n.id === id);
