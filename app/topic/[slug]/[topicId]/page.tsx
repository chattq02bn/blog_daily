import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import TopicDetail from "./TopicDetail";
import { getQueryClient } from "@/lib/query-client";
import { topicsApi } from "@/lib/api";

type PageProps = {
  params: Promise<{ slug: string; topicId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Chủ đề ${slug} | note` };
}

export default async function TopicDetailPage({ params }: PageProps) {
  const { slug, topicId } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["topicPostsByTopicId", slug, topicId, 12],
    queryFn: ({ pageParam }) =>
      topicsApi.topicPostsByTopicId(slug, topicId, { page: pageParam, limit: 12 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: { meta?: { page: number; totalPages: number } }) => {
      const meta = lastPage.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
  });

  return (
    <AppLayout>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TopicDetail slug={slug} topicId={topicId} />
      </HydrationBoundary>
    </AppLayout>
  );
}
