import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import SectionDetail from "./SectionDetail";
import { getQueryClient } from "@/lib/query-client";
import { qk } from "@/lib/query-keys";
import { postsApi, sectionsApi, type ApiSectionPostsResponse, type ApiTopicPostsResponse } from "@/lib/api";

type PageProps = {
  params: Promise<{ slug: string; sectionId: string }>;
  searchParams: Promise<{ sidebarId?: string }>;
};

function isVirtualTopicSection(sectionId: string) {
  return sectionId.startsWith("topic-");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, sectionId } = await params;
  if (isVirtualTopicSection(sectionId)) {
    return { title: `Danh sách ${slug} | note` };
  }
  return { title: `Chuyên mục | ${slug} | note` };
}

export default async function SectionDetailPage({ params, searchParams }: PageProps) {
  const { slug, sectionId } = await params;
  const { sidebarId } = await searchParams;
  const queryClient = getQueryClient();
  const isVirtual = isVirtualTopicSection(sectionId);

  if (isVirtual) {
    await queryClient.prefetchInfiniteQuery({
      queryKey: [...qk.topicPosts(slug, 12), sidebarId] as const,
      queryFn: ({ pageParam }) =>
        sectionsApi.topicPosts(slug, { page: pageParam, limit: 12, sidebarId }),
      initialPageParam: 1,
      getNextPageParam: (lastPage: ApiTopicPostsResponse) => {
        const meta = lastPage.meta;
        if (!meta) return undefined;
        return meta.page < meta.totalPages ? meta.page + 1 : undefined;
      },
    });
  } else {
    await queryClient.prefetchInfiniteQuery({
      queryKey: qk.postsInfinite({ sectionId, status: "published", limit: 12 }),
      queryFn: ({ pageParam }) =>
        postsApi.listBySection(sectionId, { page: pageParam, limit: 12 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage: ApiSectionPostsResponse) => {
        const meta = lastPage.meta;
        if (!meta) return undefined;
        return meta.page < meta.totalPages ? meta.page + 1 : undefined;
      },
    });
  }

  return (
    <AppLayout>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SectionDetail slug={slug} sectionId={sectionId} sidebarId={sidebarId} />
      </HydrationBoundary>
    </AppLayout>
  );
}
