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
  searchParams: Promise<{ s?: string }>;
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
  const { s } = await searchParams;
  const initialLikedIds = await getInitialLikedIds();

  // Slug có trùng một mục trong sidebar (mục cha hoặc mục con) không?
  // - Mục cha: hiển thị header của mục cha, dữ liệu gom sections của các mục con
  // - Mục con: hiển thị header của chính mục con, dữ liệu là sections theo slug
  const sidebarItem = await getSidebarItem(slug);
  const isParent = Boolean(sidebarItem && sidebarItem.children.length > 0);
  const childrenSlugs = sidebarItem?.children.map((child) => child.slug) ?? [];

  const queryClient = getQueryClient();

  // Prefetch trước để dữ liệu có sẵn khi client render
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
        {/* Mục nào trong sidebar (kể cả mục cha lẫn mục con) cũng hiển thị header tên + mô tả */}
        {sidebarItem && (
          <TopicHeader
            topic={{
              name: sidebarItem.name,
              description: sidebarItem.description ?? "",
            }}
          />
        )}

        <HydrationBoundary state={dehydrate(queryClient)}>
          <LikesProvider initialLikedIds={initialLikedIds}>
            <TopicSectionList
              slug={slug}
              activeSectionId={s}
              childrenSlugs={isParent ? childrenSlugs : undefined}
            />
          </LikesProvider>
        </HydrationBoundary>
      </div>
    </AppLayout>
  );
}
