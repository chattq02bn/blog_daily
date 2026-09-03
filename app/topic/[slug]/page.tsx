import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import TopicSectionList from "./TopicSectionList";
import styles from "./topic.module.scss";
import { getQueryClient } from "@/lib/query-client";
import { qk } from "@/lib/query-keys";
import { topicsApi, sidebarApi, type ApiSidebarItem } from "@/lib/api";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sidebarId?: string }>;
};

async function getSidebarItem(slug: string): Promise<ApiSidebarItem | null> {
  try {
    const items = await sidebarApi.get();
    return items.find((item) => item.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  let title = `${slug} | note`;
  const item = await getSidebarItem(slug);
  if (item) {
    title = `${item.name} | note`;
  }

  return { title };
}

export default async function TopicDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { sidebarId } = await searchParams;

  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: qk.topicPosts(slug, 10),
    queryFn: ({ pageParam }) =>
      topicsApi.topicPosts(slug, {
        page: 1,
        limit: 12,
        sidebarId,
        topicsPage: pageParam as number,
        topicsLimit: 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (_lastPage: { totalTopicsPages?: number }, allPages) => {
      const totalTopicsPages = allPages[0]?.totalTopicsPages ?? 0;
      if (allPages.length < totalTopicsPages) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });

  return (
    <AppLayout>
      <div className={styles.page}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <TopicSectionList slug={slug} sidebarId={sidebarId} />
        </HydrationBoundary>
      </div>
    </AppLayout>
  );
}
