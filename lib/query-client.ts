import { QueryClient, defaultShouldDehydrateQuery, type DehydratedState } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: mỗi request một client mới
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

/** Prefetch nhiều queries trên server rồi trả về state để bọc HydrationBoundary */
export async function dehydratePrefetch(
  prefetches: Promise<unknown>[]
): Promise<DehydratedState> {
  const queryClient = getQueryClient();
  await Promise.all(prefetches.map((p) => p.catch(() => undefined)));
  return dehydrate(queryClient);
}
