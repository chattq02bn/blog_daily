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
  ApiUser,
  ApiVisits,
} from "./types";
import api from "@/lib/axios";

export * from "./types";

/* ===== Envelope helpers ===== */

type Envelope<T> = { success: boolean; message?: string; data: T; meta?: ApiMeta };

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
};

/* ===== Topics & sections ===== */

export const topicsApi = {
  async list(): Promise<ApiTopic[]> {
    return unwrap(await api.get<Envelope<ApiTopic[]>>("/topics"));
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
  ): Promise<{ data: ApiSection[]; meta?: ApiMeta }> {
    const res = await api.get<Envelope<ApiSection[]>>(
      `/topics/${topicSlug}/sections/paginated`,
      { params }
    );
    return { data: res.data.data, meta: res.data.meta };
  },
};

/* ===== Tags ===== */

export const tagsApi = {
  async list(): Promise<ApiTag[]> {
    return unwrap(await api.get<Envelope<ApiTag[]>>("/tags"));
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
  async create(postIdOrSlug: string, body: CommentWriteBody): Promise<ApiComment> {
    return unwrap(await api.post<Envelope<ApiComment>>(`/comments/post/${postIdOrSlug}`, body));
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
  async get(): Promise<ApiSidebarItem[]> {
    return unwrap(await api.get<Envelope<ApiSidebarItem[]>>("/sidebar"));
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
