import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import LikesProvider from "@/components/likes/LikesProvider";
import HomeSections from "@/components/topic/HomeSections";
import { getQueryClient } from "@/lib/query-client";
import { qk } from "@/lib/query-keys";
import { getInitialLikedIds } from "@/lib/post-likes.server";
import { flattenTopics, HOME_SIDEBAR_PAGE_LIMIT, HOME_TOPICS_PER_SCROLL, sectionPostsParams } from "@/lib/sidebar-utils";
import { postsApi, sidebarApi, type SidebarPage } from "@/lib/api";

export default async function Home() {
  const queryClient = getQueryClient();
  const initialLikedIds = await getInitialLikedIds();

  // Prefetch trước khi render để client nhận sẵn dữ liệu qua HydrationBoundary:
  // - Trang 1 của sidebar (dạng infinite query, khớp key với useSidebarTopicsInfinite)
  // - Posts của các topic trong trang đó -> các section đầu render không skeleton
  const firstPage: SidebarPage = await sidebarApi.list({
    page: 1,
    limit: HOME_SIDEBAR_PAGE_LIMIT,
    childrenLimit: 5,
  });

  await Promise.all([
    queryClient.prefetchInfiniteQuery({
      queryKey: qk.sidebarInfinite(HOME_SIDEBAR_PAGE_LIMIT),
      queryFn: ({ pageParam }) =>
        sidebarApi.list({ page: pageParam as number, limit: HOME_SIDEBAR_PAGE_LIMIT }),
      initialPageParam: 1,
      getNextPageParam: (lastPage: SidebarPage) => {
        const meta = lastPage.meta;
        if (!meta) return undefined;
        return meta.page < meta.totalPages ? meta.page + 1 : undefined;
      },
    }),
    ...flattenTopics(firstPage.data, HOME_TOPICS_PER_SCROLL).map((item) => {
      const params = sectionPostsParams(item);
      return queryClient.prefetchQuery({
        queryKey: qk.posts(params),
        queryFn: () => postsApi.list(params),
      });
    }),
  ]);

  return (
    <AppLayout>
      <h1 className="sr-only">Chủ đề</h1>
      <div className="mx-auto min-h-screen pb-4 sm:px-4 sm:pb-6 lg:px-0">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <LikesProvider initialLikedIds={initialLikedIds}>
            <HomeSections />
          </LikesProvider>
        </HydrationBoundary>
      </div>
    </AppLayout>
  );
}
