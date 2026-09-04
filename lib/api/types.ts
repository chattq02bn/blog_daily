export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiTopicInfo {
  name: string;
  description: string;
}

export interface ApiAuthor {
  id: number;
  name: string | null;
  email: string;
  avatar?: string | null;
  description?: string | null;
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
  topicIds: string[];
  tagIds: string[];
  topics: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  sidebarId: string | null;
  sidebar: { id: string; name: string; slug: string } | null;
  author: ApiAuthor | null;
  authorAvatar: string | null;
  authorName: string;
  authorDescription: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
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
  authorAvatar: string | null;
  isAuthor: boolean;
  parentAuthor?: string;
  content: string;
  isEdited: boolean;
  likes: number;
  createdAt: string;
  updatedAt: string;
  /** Số reply trực tiếp — dùng để hiện nút "Xem phản hồi" và load phân trang */
  repliesCount: number;
}

export type ApiUserRole = "admin" | "user";
export type ApiUserStatus = "active" | "inactive";
export type ApiMailStatus = "pending" | "sent" | "failed";

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  role: ApiUserRole;
  status: ApiUserStatus;
  mailStatus: ApiMailStatus;
  mailError: string | null;
  avatar: string | null;
  logoName: string | null;
  description: string | null;
  postsCount: number;
  reactionsCount: number;
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

export interface ApiTopicPostsSidebar {
  name: string;
  description: string;
  slug: string;
}

export interface ApiTopicPostsGroup {
  id: string;
  name: string;
  description: string;
  posts: ApiPost[];
}

export interface ApiTopicPostsResponse {
  data: ApiPost[];
  meta?: ApiMeta;
  sidebar: ApiTopicPostsSidebar;
  topics: ApiTopicPostsGroup[];
  topicPostCount: number;
  totalTopics: number;
  totalTopicsPages: number;
}

export interface ApiTopicPostsByTopicIdResponse {
  data: ApiPost[];
  meta: ApiMeta;
  topic: { id: string; name: string; description: string };
}

export interface ApiVisits {
  month: string;
  days: { day: number; visits: number }[];
}
