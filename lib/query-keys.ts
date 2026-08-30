import type { ListPostsParams } from "@/lib/api";

export const qk = {
  searchPosts: (q: string) => ["posts", "search", q] as const,
  posts: (params?: ListPostsParams) => ["posts", params ?? {}] as const,
  postsInfinite: (params?: Omit<ListPostsParams, "page">) =>
    ["posts", "infinite", params ?? {}] as const,
  post: (idOrSlug: string) => ["post", idOrSlug] as const,
  postLike: (postId: string) => ["postLike", postId] as const,
  topics: () => ["topics"] as const,
  sections: (topicSlug: string) => ["sections", topicSlug] as const,
  sectionsInfinite: (topicSlug: string) => ["sections", "infinite", topicSlug] as const,
  sectionsMulti: (slugs: string[]) => ["sections", "multi", [...slugs].sort().join(",")] as const,
  tags: () => ["tags"] as const,
  comments: (postIdOrSlug: string) => ["comments", postIdOrSlug] as const,
  commentsInfinite: (noteId: string, limit = 10) =>
    ["comments", "infinite", noteId, limit] as const,
  repliesInfinite: (commentId: string, limit = 5) =>
    ["comments", "replies", commentId, limit] as const,
  users: (params: { page?: number; limit?: number; q?: string; role?: "USER" | "ADMIN" }) =>
    ["users", params ?? {}] as const,
  profile: () => ["profile"] as const,
  sidebar: () => ["sidebar"] as const,
  sidebarInfinite: (limit = 3) => ["sidebar", "infinite", limit] as const,
  visits: (month?: string) => ["visits", month ?? "current"] as const,
  mailConfig: () => ["mailConfig"] as const,
};
