import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import SectionDetail from "./SectionDetail";
import { getQueryClient } from "@/lib/query-client";
import { qk } from "@/lib/query-keys";
import { postsApi, type ApiSectionPostsResponse } from "@/lib/api";

type PageProps = {
  params: Promise<{ slug: string; sectionId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Chuyên mục | ${slug} | note` };
}

export default async function SectionDetailPage({ params }: PageProps) {
  const { slug, sectionId } = await params;
  const queryClient = getQueryClient();

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

  return (
    <AppLayout>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SectionDetail slug={slug} sectionId={sectionId} />
      </HydrationBoundary>
    </AppLayout>
  );
}
