import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import LikesProvider from "@/components/likes/LikesProvider";
import TopicHeader from "@/components/topic/TopicHeader";
import TopicSectionList from "./TopicSectionList";
import styles from "./topic.module.scss";
import { getQueryClient } from "@/lib/query-client";
import { qk } from "@/lib/query-keys";
import { getInitialLikedIds } from "@/lib/post-likes.server";
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
  const initialLikedIds = await getInitialLikedIds();

  const sidebarItem = await getSidebarItem(slug);
  const isParent = Boolean(sidebarItem && sidebarItem.children.length > 0);
  const childrenSlugs = sidebarItem?.children.map((child) => child.slug) ?? [];

  const topicHref = "/";

  const queryClient = getQueryClient();

  if (isParent) {
    await queryClient.prefetchQuery({
      queryKey: qk.sectionsMulti(childrenSlugs),
      queryFn: () => sectionsApi.byTopicSlugs(childrenSlugs),
    });
  } else {
    await queryClient.prefetchQuery({
      queryKey: qk.sections(slug),
      queryFn: () => sectionsApi.byTopic(slug),
    });
  }

  return (
    <AppLayout>
      <div className={styles.page}>
        {sidebarItem && (
          <TopicHeader
            topic={{
              name: sidebarItem.name,
              description: sidebarItem.description ?? "",
            }}
            href={topicHref}
          />
        )}

        <HydrationBoundary state={dehydrate(queryClient)}>
          <LikesProvider initialLikedIds={initialLikedIds}>
            <TopicSectionList
              slug={slug}
              childrenSlugs={isParent ? childrenSlugs : undefined}
            />
          </LikesProvider>
        </HydrationBoundary>
      </div>
    </AppLayout>
  );
}
