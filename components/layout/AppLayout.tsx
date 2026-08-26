import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { getQueryClient } from "@/lib/query-client";
import { qk } from "@/lib/query-keys";
import {
  SIDEBAR_CHILDREN_LIMIT,
  SIDEBAR_NAV_PAGE_SIZE,
} from "@/lib/sidebar-utils";
import { sidebarApi, type SidebarPage } from "@/lib/api";

export default async function AppLayout({
  children,
  hideSidebar = false,
}: {
  children: React.ReactNode;
  hideSidebar?: boolean;
}) {
  const queryClient = getQueryClient();

  /* Prefetch trang đầu của sidebar nav để render SSR ngay, không skeleton */
  if (!hideSidebar) {
    await queryClient.prefetchInfiniteQuery({
      queryKey: qk.sidebarInfinite(SIDEBAR_NAV_PAGE_SIZE),
      queryFn: ({ pageParam }) =>
        sidebarApi.list({
          page: pageParam as number,
          limit: SIDEBAR_NAV_PAGE_SIZE,
          childrenLimit: SIDEBAR_CHILDREN_LIMIT,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage: SidebarPage) => {
        const meta = lastPage.meta;
        if (!meta) return undefined;
        return meta.page < meta.totalPages ? meta.page + 1 : undefined;
      },
    });
  }

  return (
    <div className="isolate flex h-dvh flex-col">
      <Navbar />
      <div className="flex min-h-0 flex-1 lg:ml-4 lg:mt-2 mt-3">
        <HydrationBoundary state={dehydrate(queryClient)}>
          {!hideSidebar && <Sidebar />}
          <main
            id="main-content"
            className="min-h-0 flex-1 overflow-x-clip overflow-y-auto"
          >
            {children}
          </main>
        </HydrationBoundary>
      </div>
    </div>
  );
}
