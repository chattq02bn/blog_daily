"use client";

import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { useSectionsInfinite } from "@/hooks/use-api";
import { useInView } from "@/hooks/use-in-view";
import TopicSectionView from "@/components/topic/TopicSectionView";
import TopicCard from "@/components/topic/TopicCard";
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
  childrenSlugs?: string[];
}) {
  const router = useRouter();
  const { sections, topic, topicPosts, topicPostCount, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage, data } =
    useSectionsInfinite(slug, 5, sidebarId);

  const { ref: sentinelRef } = useInView<HTMLDivElement>({
    rootMargin: "400px",
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

  const totalNotes = topicPostCount ?? (sections.length > 0
    ? sections.reduce((sum, section) => sum + section.posts.length, 0)
    : (data?.pages[0]?.meta?.total ?? topicPosts?.length ?? 0));

  return (
    <>
      {topic && (
        <TopicHeader
          topic={{
            name: topic.name,
            description: topic.description ?? "",
          }}
          href={"/"}
        />
      )}
      <p className={styles.count}>
        {totalNotes.toLocaleString("vi-VN")} bài viết · cập nhật hàng ngày
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

      {sections.length > 0 ? (
        sections.map((section, index) => {
          const detailHref = sidebarId
            ? `/topic/${slug}/${section.id}?sidebarId=${sidebarId}`
            : `/topic/${slug}/${section.id}`;

          return (
            <section key={section.id} className={styles.section}>
              <TopicSectionView
                title={section.title}
                description={section.description ?? undefined}
                href={detailHref}
                notes={section.posts.slice(0, MAX_NOTES).map(postToNote)}
                featured={index === 0}
              />
            </section>
          );
        })
      ) : topicPosts && topicPosts.length > 0 ? (
        <div className={styles.grid}>
          {topicPosts.map((post) => (
            <TopicCard key={post.id} note={postToNote(post)} />
          ))}
        </div>
      ) : (
        <p className={styles.count}>Chưa có bài viết nào.</p>
      )}

      <div ref={sentinelRef} aria-hidden="true" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Spin size="small" />
            <span>{sections.length > 0 ? "Đang tải thêm chủ đề..." : "Đang tải thêm bài viết..."}</span>
          </div>
        </div>
      )}
    </>
  );
}
