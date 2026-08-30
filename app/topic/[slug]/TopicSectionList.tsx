"use client";

import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { useSectionsInfinite } from "@/hooks/use-api";
import { useInView } from "@/hooks/use-in-view";
import TopicSectionView from "@/components/topic/TopicSectionView";
import { postToNote } from "@/lib/api/adapters";
import styles from "./topic.module.scss";

const MAX_NOTES = 14;

export default function TopicSectionList({
  slug,
}: {
  slug: string;
  childrenSlugs?: string[];
}) {
  const router = useRouter();
  const { sections, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSectionsInfinite(slug, 5);

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

  if (isError || sections.length === 0) {
    return (
      <p className={styles.count}>Không tải được nội dung chủ đề này.</p>
    );
  }
  console.log("sections", sections);

  const totalNotes = sections.reduce((sum, section) => sum + section.posts.length, 0);

  return (
    <>
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

      {sections.map((section, index) => {
        const detailHref = `/topic/${slug}/${section.id}`;

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
      })}

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
