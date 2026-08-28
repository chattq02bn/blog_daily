export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiAuthor {
  id: number;
  name: string | null;
  email: string;
  avatar?: string | null;
}

export interface ApiPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover: string | null;
  bodyBlocks: unknown[];
  status: "draft" | "published";
  likes: number;
  bookmarks: number;
  commentsCount: number;
  sectionId: string | null;
  topicIds: string[];
  tagIds: string[];
  topics: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  author: ApiAuthor | null;
  authorAvatar: string | null;
  authorName: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSection {
  id: string;
  slug: string;
  title: string;
  description: string;
  idx: number;
  /** topicSlug mà section thuộc về */
  topicSlug: string;
  posts: ApiPost[];
}

/** Section info không có posts (dùng cho response phân trang) */
export interface ApiSectionInfo {
  id: string;
  slug: string;
  title: string;
  description: string;
  idx: number;
  topicSlug: string;
}

/** Response từ API /posts/section/:sectionId */
export interface ApiSectionPostsResponse {
  data: ApiPost[];
  meta?: ApiMeta;
  section: ApiSectionInfo;
}

export interface ApiTopic {
  id: string;
  name: string;
  description: string | null;
  postCount: number;
}

export interface ApiTag {
  id: string;
  name: string;
}

export interface ApiSidebarItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  idx: number;
  topicIds: string[];
  /** Số mục con trực tiếp — dùng cho nút lazy-load */
  childrenCount?: number;
  /**
   * Mục con nhúng sẵn: GET /sidebar phân trang chỉ trả tối đa 10 cái đầu,
   * phần còn lại load qua /sidebar/:id/children
   */
  children: ApiSidebarItem[];
}

export interface ApiComment {
  id: string;
  noteId: string;
  parentId: string | null;
  commenterId: number;
  author: string;
  parentAuthor?: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  reactions: { emoji: string; count: number }[];
  myReactions: string[];
  /** Số reply trực tiếp — dùng để hiện nút "Xem phản hồi" và load phân trang */
  repliesCount: number;
}

export type ApiUserRole = "admin" | "user";

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  role: ApiUserRole;
  avatar: string | null;
  logoName: string | null;
  description: string | null;
  postsCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAuthUser {
  id: number;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
}

export interface ApiAuthSession {
  user: ApiAuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface ApiVisits {
  month: string;
  days: { day: number; visits: number }[];
}
