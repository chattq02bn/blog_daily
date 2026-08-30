"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  commentsApi,
  commentersApi,
  mailApi,
  postsApi,
  profileApi,
  sectionsApi,
  sidebarApi,
  socialLinksApi,
  statsApi,
  tagsApi,
  topicsApi,
  uploadApi,
  usersApi,
  type CommentWriteBody,
  type ListPostsParams,
  type PostWriteBody,
  type ApiComment,
  type ApiMailConfig,
  type ApiPost,
  type ApiSocialLink,
  type ApiUploadConfig,
  type PostsPage,
  type SocialPlatform,
} from "@/lib/api";
import { qk } from "@/lib/query-keys";

/* ===== Query functions (dùng chung cho prefetch server + hooks client) ===== */

export const queryFns = {
  posts: (params: ListPostsParams) => () => postsApi.list(params),
  post: (idOrSlug: string) => () => postsApi.get(idOrSlug),
  sections: (topicSlug: string) => () => sectionsApi.byTopic(topicSlug),
  topics: (params?: { page?: number; limit?: number; q?: string }) => () => topicsApi.list(params),
  tags: (params?: { page?: number; limit?: number; q?: string }) => () => tagsApi.list(params),
  comments: (postIdOrSlug: string) => () => commentsApi.listByPost(postIdOrSlug),
  users: (params: { page?: number; limit?: number; q?: string; role?: "USER" | "ADMIN" }) =>
    () => usersApi.list(params),
  profile: () => profileApi.get(),
  sidebar: () => sidebarApi.get(),
  visits: (month?: string) => () => statsApi.visits(month),
};

/* ===== Posts ===== */

export function usePosts(
  params: ListPostsParams = {},
  hooks?: { onSettled?: () => void }
) {
  return useQuery({
    queryKey: qk.posts(params),
    queryFn: async () => {
      try {
        const result = await postsApi.list(params);
        return result;
      } finally {
        /* Luôn gọi kể cả khi lỗi để caller không kẹt trạng thái "đang tải" */
        hooks?.onSettled?.();
      }
    },
  });
}

/* Infinite query cho infinite scroll (Home sections...) */
export function usePostsInfinite(params: Omit<ListPostsParams, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: qk.postsInfinite(params),
    queryFn: ({ pageParam }) => postsApi.list({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
  });
}

/* Infinite query cho section detail — trả về posts + section info */
export function useSectionPostsInfinite(sectionId: string, limit = 12) {
  const query = useInfiniteQuery({
    queryKey: qk.postsInfinite({ sectionId, status: "published", limit }),
    queryFn: ({ pageParam }) =>
      postsApi.listBySection(sectionId, { page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    enabled: Boolean(sectionId),
  });

  const section = query.data?.pages[0]?.section;
  const posts = query.data?.pages.flatMap((page) => page.data) ?? [];
  const totalPosts = query.data?.pages[0]?.meta?.total ?? 0;

  return {
    ...query,
    section,
    posts,
    totalPosts,
  };
}

export function usePost(idOrSlug: string) {
  return useQuery({
    queryKey: qk.post(idOrSlug),
    queryFn: () => postsApi.get(idOrSlug),
    enabled: Boolean(idOrSlug),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PostWriteBody & { title: string }) => postsApi.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["posts"] });
      void qc.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PostWriteBody }) => postsApi.update(id, body),
    onSuccess: (post) => {
      void qc.invalidateQueries({ queryKey: ["posts"] });
      void qc.invalidateQueries({ queryKey: ["sections"] });
      qc.setQueryData(qk.post(post.id), post);
      qc.setQueryData(qk.post(post.slug), post);
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["posts"] });
      void qc.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}

export function useTogglePostAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, active }: { id: string; action: "like" | "bookmark"; active: boolean }) =>
      postsApi.toggleAction(id, action, active),
    onMutate: async ({ id, action, active }) => {
      const field = action === "like" ? "likes" : "bookmarks";
      const delta = active ? 1 : -1;

      // Update all cached queries that contain this post
      const queryCache = qc.getQueryCache();
      queryCache.getAll().forEach((query) => {
        const key = query.queryKey;
        if (typeof key[0] !== "string" || key[0] !== "post") return;

        qc.setQueryData(key, (old: ApiPost | undefined) => {
          if (!old || old.id !== id) return old;
          return { ...old, [field]: Math.max(0, old[field] + delta) };
        });
      });

      // Also update posts list/infinite caches
      qc.setQueriesData(
        { queryKey: ["posts"] },
        (old: PostsPage | { pages: { data: ApiPost[] }[] } | undefined) => {
          if (!old) return old;
          if ("pages" in old) {
            // Infinite query
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((p) =>
                  p.id === id ? { ...p, [field]: Math.max(0, p[field] + delta) } : p
                ),
              })),
            };
          }
          if ("data" in old) {
            // Regular query
            return {
              ...old,
              data: old.data.map((p) =>
                p.id === id ? { ...p, [field]: Math.max(0, p[field] + delta) } : p
              ),
            };
          }
          return old;
        }
      );
    },
  });
}

/* ===== Topics & sections ===== */

export function useTopics(params?: { page?: number; limit?: number; q?: string }) {
  return useQuery({ queryKey: qk.topics(params), queryFn: () => topicsApi.list(params) });
}

export function useSections(topicSlug: string) {
  return useQuery({
    queryKey: qk.sections(topicSlug),
    queryFn: () => sectionsApi.byTopic(topicSlug),
    enabled: Boolean(topicSlug),
  });
}

/* Infinite query cho sections theo topicSlug — phân trang */
export function useSectionsInfinite(topicSlug: string, limit = 5) {
  const query = useInfiniteQuery({
    queryKey: [...qk.sectionsInfinite(topicSlug), limit] as const,
    queryFn: ({ pageParam }) =>
      sectionsApi.byTopicPaginated(topicSlug, { page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    enabled: Boolean(topicSlug),
  });

  return {
    sections: query.data?.pages.flatMap((page) => page.data) ?? [],
    topic: query.data?.pages[0]?.topic,
    ...query,
  };
}

/* Sections của nhiều mục con một lúc (trang chủ đề khi click vào mục cha sidebar) */
export function useSectionsBySlugs(slugs: string[]) {
  return useQuery({
    queryKey: qk.sectionsMulti(slugs),
    queryFn: () => sectionsApi.byTopicSlugs(slugs),
    enabled: slugs.length > 0,
  });
}

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string }) => topicsApi.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["topics"] });
      void qc.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });
}

export function useUpdateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name?: string; description?: string } }) =>
      topicsApi.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["topics"] });
      void qc.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => topicsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["topics"] });
      void qc.invalidateQueries({ queryKey: ["sidebar"] });
      void qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/* ===== Tags ===== */

export function useTags(params?: { page?: number; limit?: number; q?: string }) {
  return useQuery({ queryKey: qk.tags(params), queryFn: () => tagsApi.list(params) });
}

function invalidateTagDependents(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: ["tags"] });
  void qc.invalidateQueries({ queryKey: ["posts"] });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => tagsApi.create(name),
    onSuccess: () => invalidateTagDependents(qc),
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => tagsApi.update(id, name),
    onSuccess: () => invalidateTagDependents(qc),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagsApi.remove(id),
    onSuccess: () => invalidateTagDependents(qc),
  });
}

/* ===== Comments ===== */

/* Bình luận gốc của bài — PHÂN TRANG qua server, "Xem thêm" sẽ call trang tiếp theo */
export function useCommentsInfinite(noteId: string, limit = 10) {
  return useInfiniteQuery({
    queryKey: qk.commentsInfinite(noteId, limit),
    queryFn: ({ pageParam }) =>
      commentsApi.listByPost(noteId, { page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    enabled: Boolean(noteId),
  });
}

/* Reply của một bình luận — cũng phân trang, chỉ load khi được mở */
export function useRepliesInfinite(commentId: string | null, limit = 10) {
  return useInfiniteQuery({
    queryKey: qk.repliesInfinite(commentId ?? "", limit),
    queryFn: ({ pageParam }) =>
      commentsApi.listReplies(commentId!, { page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    enabled: Boolean(commentId),
  });
}

export function useCreateComment(postIdOrSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, rootCommentId }: { body: CommentWriteBody; rootCommentId?: string }) =>
      commentsApi.create(postIdOrSlug, body),
    onSuccess: (newComment) => {
      if (newComment.parentId) {
        /* Reply — optimistic replies handled by component state (optimisticRepliesMap) */
      } else {
        /* Bình luận gốc — prepend vào cache commentsInfinite */
        const key = qk.commentsInfinite(postIdOrSlug);
        qc.setQueryData(key, (old: { pages: { data: ApiComment[]; meta?: { page: number; limit: number; total: number; totalPages: number } }[] } | undefined) => {
          const newRoot = { ...newComment, repliesCount: 0 };
          if (!old) {
            return { pages: [{ data: [newRoot], meta: { page: 1, limit: 10, total: 1, totalPages: 1 } }], pageParams: [1] };
          }
          const firstPage = old.pages[0];
          if (!firstPage) return old;
          const newTotal = (firstPage.meta?.total ?? 0) + 1;
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                data: [newRoot, ...firstPage.data],
                meta: { ...firstPage.meta, total: newTotal, totalPages: Math.ceil(newTotal / (firstPage.meta?.limit ?? 10)) },
              },
              ...old.pages.slice(1),
            ],
          };
        });
      }

      /* Tăng commentsCount trên post */
      qc.setQueryData(qk.post(postIdOrSlug), (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        return { ...old, commentsCount: ((old.commentsCount as number) ?? 0) + 1 };
      });
    },
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CommentWriteBody }) =>
      commentsApi.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      commentsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useToggleCommentReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, emoji }: { id: string; emoji: string }) =>
      commentsApi.toggleReaction(id, emoji),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useUpdateCommenterNickname() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nickname: string) => commentersApi.updateNickname(nickname),
    onSuccess: (updated, newNickname) => {
      const commenterId = Number(localStorage.getItem("note_commenter_id"));
      const oldNickname = localStorage.getItem("note_commenter_nickname");
      if (!commenterId) return;

      qc.setQueriesData(
        { queryKey: ["comments"] },
        (old: { pages: { data: ApiComment[] }[]; pageParams: unknown[] } | undefined) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((c) => {
                const updated = c.commenterId === commenterId
                  ? { ...c, author: newNickname }
                  : c;
                /* Cập nhật parentAuthor nếu tên cũ khớp */
                return oldNickname && updated.parentAuthor === oldNickname
                  ? { ...updated, parentAuthor: newNickname }
                  : updated;
              }),
            })),
          };
        }
      );

      localStorage.setItem("note_commenter_nickname", newNickname);
    },
  });
}

/* ===== Users ===== */

export function useUsers(params: { page?: number; limit?: number; q?: string; role?: "USER" | "ADMIN" } = {}) {
  return useQuery({ queryKey: qk.users(params), queryFn: () => usersApi.list(params) });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; email: string; password: string; role?: "USER" | "ADMIN" }) =>
      usersApi.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { name?: string; email?: string; role?: "USER" | "ADMIN"; password?: string };
    }) => usersApi.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.toggleStatus(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useResendMail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.resendMail(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

/* ===== Profile ===== */

export function useProfile() {
  return useQuery({
    queryKey: qk.profile(),
    queryFn: profileApi.get,
    enabled: typeof window !== "undefined" && Boolean(localStorage.getItem("note_access_token")),
    retry: false,
    staleTime: 30 * 24 * 60 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name?: string;
      avatar?: string | null;
      logoName?: string | null;
      description?: string | null;
    }) => profileApi.update(body),
    onSuccess: (profile) => {
      qc.setQueryData(qk.profile(), profile);
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

/* ===== Social Links ===== */

export function useActiveSocialLinks() {
  return useQuery({
    queryKey: ["social-links", "active"],
    queryFn: socialLinksApi.getActive,
  });
}

export function useSocialLinks() {
  return useQuery({
    queryKey: ["social-links"],
    queryFn: socialLinksApi.getAll,
  });
}

export function useUpdateSocialLinks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (links: { platform: SocialPlatform; url: string }[]) =>
      socialLinksApi.update(links),
  });
}

/* ===== Sidebar ===== */

export function useSidebar(params?: { q?: string }) {
  return useQuery({
    queryKey: qk.sidebar(params),
    queryFn: () => sidebarApi.get(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/* Topic ở trang chủ — phân trang theo mục gốc qua BE, "kéo xuống" nạp mục tiếp theo */
export function useSidebarTopicsInfinite(
  limit = 3,
  hooks?: { onStart?: () => void; onSettled?: () => void }
) {
  return useInfiniteQuery({
    queryKey: qk.sidebarInfinite(limit),
    queryFn: async ({ pageParam }) => {
      hooks?.onStart?.();
      try {
        return await sidebarApi.list({
          page: pageParam as number,
          limit,
          childrenLimit: 5,
        });
      } finally {
        /* Luôn gọi kể cả lỗi để caller tắt trạng thái loading */
        hooks?.onSettled?.();
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
  });
}

/* Mục con của một mục cha — phân trang theo OFFSET (trang đầu có thể khác kích thước) */
export function useSidebarChildren(parentId: string | null, initialOffset = 0, limit = 5) {
  return useInfiniteQuery({
    queryKey: ["sidebar", "children", parentId, initialOffset, limit] as const,
    queryFn: ({ pageParam }) =>
      sidebarApi.listChildren(parentId!, {
        offset: pageParam as number,
        limit,
      }),
    initialPageParam: initialOffset,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
      const base = initialOffset;
      return base + loaded < lastPage.total ? base + loaded : undefined;
    },
    enabled: Boolean(parentId),
  });
}

export function useReplaceSidebar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: unknown[]) => sidebarApi.replace(items),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });
}

export function useCreateSidebarItem() {
  return useMutation({
    mutationFn: (body: {
      name: string;
      slug: string;
      description?: string;
      topicIds?: string[];
      parentId?: string;
    }) => sidebarApi.create(body),
  });
}

/* ===== Stats ===== */

export function useVisits(month?: string) {
  return useQuery({ queryKey: qk.visits(month), queryFn: () => statsApi.visits(month) });
}

/* ===== Mail Config ===== */

export function useMailConfig() {
  return useQuery({
    queryKey: qk.mailConfig(),
    queryFn: () => mailApi.getConfig(),
  });
}

export function useUpdateMailConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiMailConfig) => mailApi.updateConfig(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.mailConfig() });
    },
  });
}

/* ===== Upload Config ===== */

export function useUploadConfig() {
  return useQuery({
    queryKey: qk.uploadConfig(),
    queryFn: () => uploadApi.getConfig(),
  });
}

export function useUpdateUploadConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiUploadConfig) => uploadApi.updateConfig(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.uploadConfig() });
    },
  });
}
