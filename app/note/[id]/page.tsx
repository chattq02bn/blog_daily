import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import NoteView from "./NoteView";
import { commentsApi, postsApi, socialLinksApi, type CommentsPage } from "@/lib/api";
import { getQueryClient } from "@/lib/query-client";
import { qk } from "@/lib/query-keys";

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
    queryClient.prefetchQuery({
      queryKey: ["social-links", "active"],
      queryFn: socialLinksApi.getActive,
    }),
  ]);

  return (
    <AppLayout hideSidebar>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <NoteView id={id} />
      </HydrationBoundary>
    </AppLayout>
  );
}
