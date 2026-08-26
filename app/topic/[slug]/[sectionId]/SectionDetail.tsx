"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useInView } from "@/hooks/use-in-view";
import { useSectionPostsInfinite } from "@/hooks/use-api";
import TopicCard from "@/components/topic/TopicCard";
import { postToNote } from "@/lib/api/adapters";
import styles from "../topic.module.scss";

export default function SectionDetail({
  slug,
  sectionId,
}: {
  slug: string;
  sectionId: string;
}) {
  const router = useRouter();

  const {
    section,
    posts,
    totalPosts,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSectionPostsInfinite(sectionId, 15);

  const { ref: sentinelRef } = useInView<HTMLDivElement>({
    rootMargin: "600px",
    onEnter: () => {
      if (hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
  });

  return (
    <div className={styles.page}>
      <div className={"mb-6"}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => router.back()}
        >
          ← Quay lại
        </button>
      </div>
      {
        section &&
        <div className="mb-1">
          <div className={`${styles.titleLink} font-bold text-text-primary text-lg sm:text-xl`}>
            <span className="mr-3">{section.title}</span>
            <span className={styles.titleArrow}>
              <RightOutlined />
            </span>
          </div>
          {section.description && (
            <p className="line-clamp-3 text-sm text-text-secondary mt-2">
              {section.description}
            </p>
          )}
        </div>
      }


      {isPending ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-surface-quaternary" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-text-secondary">
          Không tải được bài viết cho chuyên mục này.
        </p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-text-secondary">
          Chưa có bài viết nào trong chuyên mục này.
        </p>
      ) : (
        <>
          <div className={styles.grid}>
            {posts.map((post) => (
              <TopicCard key={post.id} note={postToNote(post)} />
            ))}
          </div>

          <div ref={sentinelRef} aria-hidden="true" />

          {hasNextPage && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-text-secondary border-t-transparent" />
                <span>Đang tải thêm...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
