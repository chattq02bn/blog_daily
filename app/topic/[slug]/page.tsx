import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import TopicSectionList from "./TopicSectionList";
import styles from "./topic.module.scss";
import { getQueryClient } from "@/lib/query-client";
import { qk } from "@/lib/query-keys";
import { sectionsApi, sidebarApi, type ApiSidebarItem } from "@/lib/api";

type PageProps = {
  params: Promise<{ slug: string }>;
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

export default async function TopicDetailPage({ params }: PageProps) {
  const { slug } = await params;




  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: qk.sectionsInfinite(slug),
    queryFn: ({ pageParam }) =>
      sectionsApi.byTopicPaginated(slug, { page: pageParam, limit: 5 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: { meta?: { page: number; totalPages: number } }) => {
      const meta = lastPage.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
  });

  return (
    <AppLayout>
      <div className={styles.page}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <TopicSectionList slug={slug} />
        </HydrationBoundary>
      </div>
    </AppLayout>
  );
}
