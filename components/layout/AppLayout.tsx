import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { qk } from "@/lib/query-keys";
import {
  SIDEBAR_CHILDREN_LIMIT,
  SIDEBAR_NAV_PAGE_SIZE,
} from "@/lib/sidebar-utils";
import { sidebarApi, type SidebarPage } from "@/lib/api";
import AppLayoutShell from "./AppLayoutShell";

export default async function AppLayout({
  children,
  hideSidebar = false,
}: {
  children: React.ReactNode;
  hideSidebar?: boolean;
}) {
  const queryClient = getQueryClient();

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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppLayoutShell hideSidebar={hideSidebar}>
        {children}
      </AppLayoutShell>
    </HydrationBoundary>
  );
}
