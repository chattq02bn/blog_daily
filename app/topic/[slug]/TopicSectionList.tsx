"use client";

import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { useTopicPostsInfinite, usePosts } from "@/hooks/use-api";
import { useInView } from "@/hooks/use-in-view";
import TopicSectionView from "@/components/topic/TopicSectionView";
import { postToNote } from "@/lib/api/adapters";
import styles from "./topic.module.scss";
import TopicHeader from "@/components/topic/TopicHeader";

const MAX_NOTES = 14;

export default function TopicSectionList({
  slug,
  sidebarId,
}: {
  slug: string;
  sidebarId?: string;
}) {
  const router = useRouter();
  const {
    sidebar,
    topics,
    topicPostCount,
    isPending,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useTopicPostsInfinite(slug, 10, sidebarId);

  // Query all posts in this sidebar for "Danh sách về X" section
  const sidebarPostsQuery = usePosts(
    sidebarId ? { sidebarId, limit: 14 } : {},
  );
  const sidebarPosts = sidebarPostsQuery.data?.data ?? [];

  const { ref: sentinelRef } = useInView<HTMLDivElement>({
    rootMargin: "600px",
    onEnter: () => {
      if (hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
  });

  if (isPending) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-40 rounded-2xl bg-surface-quaternary" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-48 rounded-xl bg-surface-quaternary" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className={styles.count}>Không tải được nội dung chủ đề này.</p>
    );
  }

  const hasSidebarPosts = sidebarPosts.length > 0;
  const hasTopics = topics.length > 0;

  return (
    <>
      {sidebar && (
        <TopicHeader
          topic={{
            name: sidebar.name,
            description: sidebar.description ?? "",
          }}
          href={"/"}
        />
      )}
      <p className={styles.count}>
        {topicPostCount.toLocaleString("vi-VN")} bài viết · cập nhật hàng ngày
      </p>

      <div className={styles.backLinkWrap}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => router.back()}
        >
          ← Quay lại
        </button>
      </div>

      {/* "Danh sách về X" — tất cả bài viết trong sidebar */}
      {hasSidebarPosts && sidebar && (
        <section className={styles.section}>
          <TopicSectionView
            title={`Danh sách về ${sidebar.name}`}
            description={sidebar.description ?? undefined}
            href={`/topic/${slug}?sidebarId=${sidebarId}`}
            notes={sidebarPosts.slice(0, MAX_NOTES).map(postToNote)}
            featured
          />
        </section>
      )}

      {/* Từng topic của sidebar — mỗi topic 1 hàng ngang, click header vào /topic/[slug]/[topicId] */}
      {hasTopics && topics.map((topic) => (
        <section key={topic.id} className={styles.section}>
          <TopicSectionView
            title={topic.name}
            description={topic.description || undefined}
            href={`/topic/${slug}/${topic.id}`}
            notes={topic.posts.slice(0, MAX_NOTES).map(postToNote)}
          />
        </section>
      ))}

      {!hasSidebarPosts && !hasTopics && (
        <p className={styles.count}>Chưa có bài viết nào.</p>
      )}

      {/* Sentinel cho infinite scroll topics */}
      <div ref={sentinelRef} aria-hidden="true" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Spin size="small" />
            <span>Đang tải thêm chủ đề...</span>
          </div>
        </div>
      )}
    </>
  );
}
