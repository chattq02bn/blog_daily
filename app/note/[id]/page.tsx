import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import NoteView from "./NoteView";
import LikesProvider from "@/components/likes/LikesProvider";
import { commentsApi, postsApi, type CommentsPage } from "@/lib/api";
import { getQueryClient } from "@/lib/query-client";
import { qk } from "@/lib/query-keys";
import { getInitialLikedIds } from "@/lib/post-likes.server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const note = await postsApi.get(id);
    return { title: `${note.title} | ${note.authorName} | note` };
  } catch {
    return { title: "Không tìm thấy bài viết | note" };
  }
}

export default async function NotePage({ params }: PageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();
  const initialLikedIds = await getInitialLikedIds();

  // Prefetch trước: chi tiết bài viết + trang đầu của bình luận.
  // Comments dùng useInfiniteQuery phía client nên phải prefetchInfiniteQuery
  // (prefetchQuery thường sẽ cache thiếu cấu trúc pages -> lỗi .length khi hydrate).
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: qk.post(id),
      queryFn: () => postsApi.get(id),
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: qk.commentsInfinite(id, 10),
      queryFn: ({ pageParam }) =>
        commentsApi.listByPost(id, { page: pageParam as number, limit: 10 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage: CommentsPage) => {
        const meta = lastPage.meta;
        if (!meta) return undefined;
        return meta.page < meta.totalPages ? meta.page + 1 : undefined;
      },
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LikesProvider initialLikedIds={initialLikedIds}>
        <NoteView id={id} />
      </LikesProvider>
    </HydrationBoundary>
  );
}
