import type {
  ApiAuthSession,
  ApiAuthUser,
  ApiComment,
  ApiMeta,
  ApiPost,
  ApiSection,
  ApiSectionPostsResponse,
  ApiSidebarItem,
  ApiTag,
  ApiTopic,
  ApiTopicInfo,
  ApiUser,
  ApiVisits,
} from "./types";
import api from "@/lib/axios";

export * from "./types";

/* ===== Envelope helpers ===== */

type Envelope<T, Extra = {}> = { success: boolean; message?: string; data: T; meta?: ApiMeta } & Extra;

function unwrap<T>(payload: { data: { data: T } }): T {
  return payload.data.data;
}

/* ===== Auth ===== */

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  async login(body: LoginPayload): Promise<ApiAuthSession> {
    return unwrap(await api.post<Envelope<ApiAuthSession>>("/auth/login", body));
  },
  async register(body: { name: string; email: string; password: string }): Promise<ApiAuthUser> {
    return unwrap(await api.post<Envelope<ApiAuthUser>>("/auth/register", body));
  },
  async refresh(refreshToken: string): Promise<ApiAuthSession> {
    return unwrap(await api.post<Envelope<ApiAuthSession>>("/auth/refresh", { refreshToken }));
  },
  async me(): Promise<ApiAuthUser> {
    return unwrap(await api.get<Envelope<ApiAuthUser>>("/auth/me"));
  },
  async forgotPassword(email: string): Promise<void> {
    await api.post<Envelope<void>>("/auth/forgot-password", { email });
  },
};

/* ===== Posts ===== */

export interface ListPostsParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: "draft" | "published";
  topicId?: string;
  /** Nhiều topic id — bài viết chỉ cần thuộc một trong các topic */
  topicIds?: string[];
  tagId?: string;
  sectionId?: string;
  authorId?: number;
}

export interface PostWriteBody {
  title?: string;
  excerpt?: string | null;
  cover?: string | null;
  bodyBlocks?: Record<string, unknown>[];
  status?: "draft" | "published";
  topicIds?: string[];
  tagIds?: string[];
  sectionId?: string | null;
}

export interface PostsPage {
  data: ApiPost[];
  meta?: ApiMeta;
}

export interface PostAction {
  id: string;
  likes: number;
  bookmarks: number;
  active: boolean;
}

export interface LikeState {
  isLiked: boolean;
  likeCount: number;
}

export const postsApi = {
  async list(params: ListPostsParams = {}): Promise<PostsPage> {
    const { topicIds, ...rest } = params;
    const query = {
      ...rest,
      ...(topicIds?.length ? { topicIds: topicIds.join(",") } : {}),
    };
    const res = await api.get<Envelope<ApiPost[]>>("/posts", { params: query });
    return { data: res.data.data, meta: res.data.meta };
  },
  async listBySection(sectionId: string, params: { page?: number; limit?: number } = {}): Promise<ApiSectionPostsResponse> {
    const res = await api.get<Envelope<ApiPost[]>>(`/posts/section/${sectionId}`, { params });
    return {
      data: res.data.data,
      meta: res.data.meta,
      section: (res.data as unknown as { section: ApiSectionPostsResponse["section"] }).section,
    };
  },
  async get(idOrSlug: string): Promise<ApiPost> {
    return unwrap(await api.get<Envelope<ApiPost>>(`/posts/${idOrSlug}`));
  },
  async create(body: PostWriteBody & { title: string }): Promise<ApiPost> {
    return unwrap(await api.post<Envelope<ApiPost>>("/posts", body));
  },
  async update(id: string, body: PostWriteBody): Promise<ApiPost> {
    return unwrap(await api.patch<Envelope<ApiPost>>(`/posts/${id}`, body));
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },
  async toggleAction(id: string, action: "like" | "bookmark", active: boolean): Promise<PostAction> {
    return unwrap(await api.post<Envelope<PostAction>>(`/posts/${id}/${action}`, { active }));
  },
  async getLikeState(postId: string): Promise<LikeState> {
    return unwrap(await api.get<Envelope<LikeState>>(`/posts/${postId}/like`));
  },
  async toggleLike(postId: string): Promise<LikeState> {
    return unwrap(await api.post<Envelope<LikeState>>(`/posts/${postId}/like`));
  },
};

/* ===== Topics & sections ===== */

export const topicsApi = {
  async list(params?: { page?: number; limit?: number; q?: string }): Promise<{ data: ApiTopic[]; meta?: ApiMeta }> {
    const res = await api.get<Envelope<ApiTopic[]>>("/topics", { params });
    return { data: res.data.data, meta: res.data.meta };
  },
  async create(body: { name: string; description?: string }): Promise<ApiTopic> {
    return unwrap(await api.post<Envelope<ApiTopic>>("/topics", body));
  },
  async update(id: string, body: { name?: string; description?: string }): Promise<ApiTopic> {
    return unwrap(await api.patch<Envelope<ApiTopic>>(`/topics/${id}`, body));
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/topics/${id}`);
  },
};

export const sectionsApi = {
  async byTopic(topicSlug: string): Promise<ApiSection[]> {
    return unwrap(await api.get<Envelope<ApiSection[]>>(`/topics/${topicSlug}/sections`));
  },
  /** Sections của nhiều topicSlug một lúc — dùng cho trang mục cha gom section của các mục con */
  async byTopicSlugs(slugs: string[]): Promise<ApiSection[]> {
    return unwrap(
      await api.get<Envelope<ApiSection[]>>("/topics/sections", {
        params: { slugs: slugs.join(",") },
      })
    );
  },
  /** Phân trang sections theo topicSlug */
  async byTopicPaginated(
    topicSlug: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ data: ApiSection[]; meta?: ApiMeta; topic?: ApiTopicInfo; topicPosts?: ApiPost[] }> {
    const res = await api.get<Envelope<ApiSection[], { topic?: ApiTopicInfo; topicPosts?: ApiPost[] }>>(
      `/topics/${topicSlug}/sections/paginated`,
      { params }
    );
    return { data: res.data.data, meta: res.data.meta, topic: res.data.topic, topicPosts: res.data.topicPosts };
  },
};

/* ===== Tags ===== */

export const tagsApi = {
  async list(params?: { page?: number; limit?: number; q?: string }): Promise<{ data: ApiTag[]; meta?: ApiMeta }> {
    const res = await api.get<Envelope<ApiTag[]>>("/tags", { params });
    return { data: res.data.data, meta: res.data.meta };
  },
  async create(name: string): Promise<ApiTag> {
    return unwrap(await api.post<Envelope<ApiTag>>("/tags", { name }));
  },
  async update(id: string, name: string): Promise<ApiTag> {
    return unwrap(await api.patch<Envelope<ApiTag>>(`/tags/${id}`, { name }));
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  },
};

/* ===== Comments ===== */

export interface CommentWriteBody {
  content: string;
  parentId?: string | null;
  nickname?: string;
}

export interface ListCommentsParams {
  page?: number;
  limit?: number;
}

export interface CommentsPage {
  data: ApiComment[];
  meta?: ApiMeta;
}

function commentListParams(params?: ListCommentsParams) {
  return { page: params?.page ?? 1, limit: params?.limit ?? 10 };
}

export const commentsApi = {
  /** Bình luận gốc của bài viết — phân trang */
  async listByPost(
    postIdOrSlug: string,
    params: ListCommentsParams = {}
  ): Promise<CommentsPage> {
    const res = await api.get<Envelope<ApiComment[]>>(
      `/comments/post/${postIdOrSlug}`,
      { params: commentListParams(params) }
    );
    return { data: res.data.data, meta: res.data.meta };
  },
  /** Reply trực tiếp của một bình luận — phân trang */
  async listReplies(
    commentId: string,
    params: ListCommentsParams = {}
  ): Promise<CommentsPage> {
    const res = await api.get<Envelope<ApiComment[]>>(
      `/comments/${commentId}/replies`,
      { params: commentListParams(params) }
    );
    return { data: res.data.data, meta: res.data.meta };
  },
  async create(postIdOrSlug: string, body: CommentWriteBody): Promise<ApiComment & { commenterToken?: string }> {
    const res = await api.post<Envelope<ApiComment>>(`/comments/post/${postIdOrSlug}`, body);
    const comment = res.data.data;
    const commenterToken = (res.data as unknown as { commenterToken?: string })?.commenterToken;
    return commenterToken ? { ...comment, commenterToken } : comment;
  },
  async update(id: string, body: CommentWriteBody): Promise<ApiComment> {
    return unwrap(await api.patch<Envelope<ApiComment>>(`/comments/${id}`, body));
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  },
  async toggleReaction(id: string, emoji: string): Promise<{ comment: ApiComment; active: boolean }> {
    return unwrap(
      await api.post<Envelope<{ comment: ApiComment; active: boolean }>>(`/comments/${id}/reactions`, {
        emoji,
      })
    );
  },
  async generateName(postId: string): Promise<string> {
    const res = await api.get<Envelope<{ name: string }>>("/comments/generate-name", {
      params: { postId },
    });
    return res.data.data.name;
  },
  async checkName(postId: string, name: string): Promise<boolean> {
    const res = await api.get<Envelope<{ used: boolean }>>("/comments/check-name", {
      params: { postId, name },
    });
    return res.data.data.used;
  },
};

/* ===== Users & profile (admin) ===== */

export interface ListUsersParams {
  page?: number;
  limit?: number;
  q?: string;
  role?: "USER" | "ADMIN";
}

export interface UsersPage {
  data: ApiUser[];
  meta?: ApiMeta;
}

export const usersApi = {
  async list(params: ListUsersParams = {}): Promise<UsersPage> {
    const res = await api.get<Envelope<ApiUser[]>>("/users", { params });
    return { data: res.data.data, meta: res.data.meta };
  },
  async create(body: {
    name: string;
    email: string;
    password: string;
    role?: "USER" | "ADMIN";
  }): Promise<ApiUser> {
    return unwrap(await api.post<Envelope<ApiUser>>("/users", body));
  },
  async update(
    id: string,
    body: { name?: string; email?: string; role?: "USER" | "ADMIN"; password?: string }
  ): Promise<ApiUser> {
    return unwrap(await api.patch<Envelope<ApiUser>>(`/users/${id}`, body));
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
  async toggleStatus(id: string): Promise<void> {
    await api.patch(`/users/${id}/toggle-status`);
  },
  async resendMail(id: string): Promise<{ success: boolean; email: string; error?: string }> {
    const res = await api.post<Envelope<{ success: boolean; email: string; error?: string }>>(`/users/${id}/resend-mail`);
    return res.data.data;
  },
};

export const profileApi = {
  async get(): Promise<ApiUser> {
    return unwrap(await api.get<Envelope<ApiUser>>("/users/me"));
  },
  async update(body: {
    name?: string;
    avatar?: string | null;
    logoName?: string | null;
    description?: string | null;
  }): Promise<ApiUser> {
    return unwrap(await api.patch<Envelope<ApiUser>>("/users/me", body));
  },
  async changePassword(body: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.put<Envelope<void>>("/users/me/password", body);
  },
};

/* ===== Social Links ===== */

export type SocialPlatform = "youtube" | "instagram" | "tiktok" | "facebook" | "x";

export interface ApiSocialLink {
  platform: SocialPlatform;
  url: string;
  isActive: boolean;
  idx: number;
}

export const socialLinksApi = {
  async getActive(): Promise<ApiSocialLink[]> {
    return unwrap(await api.get<Envelope<ApiSocialLink[]>>("/social-links/active"));
  },
  async getAll(): Promise<ApiSocialLink[]> {
    return unwrap(await api.get<Envelope<ApiSocialLink[]>>("/social-links"));
  },
  async update(links: { platform: SocialPlatform; url: string }[]): Promise<ApiSocialLink[]> {
    return unwrap(await api.put<Envelope<ApiSocialLink[]>>("/social-links", { links }));
  },
};

export interface ListSidebarParams {
  page?: number;
  limit?: number;
  /** Chế độ phân trang: số mục con nhúng kèm mỗi mục gốc */
  childrenLimit?: number;
}

export interface SidebarPage {
  data: ApiSidebarItem[];
  meta?: ApiMeta;
}

export interface ListSidebarChildrenParams {
  offset?: number;
  limit?: number;
}

export const sidebarApi = {
  /** Toàn cây sidebar (mục gốc + con lồng nhau) — dùng cho admin & trang chủ đề */
  async get(params?: { q?: string }): Promise<ApiSidebarItem[]> {
    return unwrap(await api.get<Envelope<ApiSidebarItem[]>>("/sidebar", { params }));
  },
  /** Phân trang theo mục gốc (mỗi gốc chỉ kèm ~10 con đầu) — dùng cho trang chủ */
  async list(params: ListSidebarParams): Promise<SidebarPage> {
    const res = await api.get<Envelope<ApiSidebarItem[]>>("/sidebar", { params });
    return { data: res.data.data, meta: res.data.meta };
  },
  /** Mục con của một mục cha — phân trang theo offset */
  async listChildren(
    id: string,
    params: ListSidebarChildrenParams = {}
  ): Promise<{ data: ApiSidebarItem[]; total: number }> {
    const res = await api.get<Envelope<ApiSidebarItem[]>>(
      `/sidebar/${id}/children`,
      { params }
    );
    return { data: res.data.data, total: res.data.meta?.total ?? res.data.data.length };
  },
  async replace(items: unknown[]): Promise<ApiSidebarItem[]> {
    return unwrap(await api.put<Envelope<ApiSidebarItem[]>>("/sidebar", { items }));
  },
  async create(body: {
    name: string;
    slug: string;
    description?: string;
    topicIds?: string[];
    parentId?: string;
  }): Promise<ApiSidebarItem> {
    return unwrap(await api.post<Envelope<ApiSidebarItem>>("/sidebar", body));
  },
};

/* ===== Stats ===== */

export const statsApi = {
  async visits(month?: string): Promise<ApiVisits> {
    return unwrap(await api.get<Envelope<ApiVisits>>("/stats/visits", { params: { month } }));
  },
};

/* ===== Commenters ===== */

export interface CreateCommenterResponse {
  commenter: { id: number; nickname: string };
  token: string;
}

export interface CommenterInfo {
  id: number;
  nickname: string;
}

export const commentersApi = {
  async create(nickname: string): Promise<CreateCommenterResponse> {
    return unwrap(await api.post<Envelope<CreateCommenterResponse>>("/commenters", { nickname }));
  },
  async updateNickname(nickname: string): Promise<CommenterInfo> {
    return unwrap(await api.patch<Envelope<CommenterInfo>>("/commenters/me", { nickname }));
  },
};

/* ===== Mail Config ===== */

export interface ApiMailConfig {
  email: string;
  password: string;
}

export const mailApi = {
  async getConfig(): Promise<ApiMailConfig> {
    return unwrap(await api.get<Envelope<ApiMailConfig>>("/mail"));
  },
  async updateConfig(body: ApiMailConfig): Promise<ApiMailConfig> {
    return unwrap(await api.put<Envelope<ApiMailConfig>>("/mail", body));
  },
};

/* ===== Upload Config ===== */

export interface ApiUploadConfig {
  cloudinary: { cloudName: string; apiKey: string; apiSecret: string; folder: string };
  mega: { email: string; password: string };
}

export interface ApiUploadResult {
  url: string;
  bytes: number;
  format: string;
  originalFilename: string;
}

export const uploadApi = {
  async getConfig(): Promise<ApiUploadConfig> {
    return unwrap(await api.get<Envelope<ApiUploadConfig>>("/upload/config"));
  },
  async updateConfig(body: ApiUploadConfig): Promise<ApiUploadConfig> {
    return unwrap(await api.put<Envelope<ApiUploadConfig>>("/upload/config", body));
  },
  async uploadFile(file: File): Promise<ApiUploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    return unwrap(
      await api.post<Envelope<ApiUploadResult>>("/upload/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
};
