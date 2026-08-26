"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RightOutlined } from "@ant-design/icons";
import { useSections, useSectionsBySlugs } from "@/hooks/use-api";
import TopicCard from "@/components/topic/TopicCard";
import TopicSectionView from "@/components/topic/TopicSectionView";
import { postToNote } from "@/lib/api/adapters";
import styles from "./topic.module.scss";

/* Chế độ xem thường: mỗi section render y như trang chủ (row ngang 14 bài + ô "Xem tất cả").
   Bấm "Xem tất cả" (thêm ?s=<sectionId>) mới trải hết bài viết của section đó ra grid. */
const MAX_NOTES = 14;

export default function TopicSectionList({
  slug,
  activeSectionId,
  childrenSlugs,
}: {
  slug: string;
  activeSectionId?: string;
  /** Có mặt = slug đang là mục cha → gom sections từ các mục con */
  childrenSlugs?: string[];
}) {
  const isParent = Boolean(childrenSlugs?.length);
  const parentQuery = useSectionsBySlugs(childrenSlugs ?? []);
  const singleQuery = useSections(slug);
  const { data, isPending, isError } = isParent ? parentQuery : singleQuery;
  const router = useRouter();

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

  if (isError || !data?.length) {
    return (
      <p className={styles.count}>Không tải được nội dung chủ đề này.</p>
    );
  }

  const expanded = Boolean(activeSectionId);
  const visible = expanded
    ? data.filter((section) => section.id === activeSectionId)
    : data;

  const totalNotes = visible.reduce((sum, section) => sum + section.posts.length, 0);

  return (
    <>
      <p className={styles.count}>
        {totalNotes.toLocaleString("vi-VN")} bài viết · cập nhật hàng ngày
      </p>

      <div className={styles.backLinkWrap}>
        {/* Quay lại trang gần nhất — trình duyệt tự khôi phục vị trí cuộn cũ */}
        <button
          type="button"
          className={styles.backLink}
          onClick={() => router.back()}
        >
          ← Quay lại
        </button>
      </div>

      {visible.map((section, index) => {
        const detailHref = `?s=${encodeURIComponent(section.id)}`;

        /* Chế độ chi tiết (đã bấm Xem tất cả): trải toàn bộ bài viết ra grid */
        if (expanded) {
          return (
            <section key={section.id} className={styles.section}>
              <Link
                href={`/topic/${slug}`}
                className={`${styles.sectionTitle} inline-flex items-center gap-2 hover:underline`}
              >
                <span>{section.title}</span>
                <RightOutlined className="text-xs text-text-secondary" />
              </Link>
              {section.description && (
                <p className={styles.sectionDesc}>{section.description}</p>
              )}
              <div className={styles.grid}>
                {section.posts.map((post) => (
                  <TopicCard key={post.id} note={postToNote(post)} />
                ))}
              </div>
            </section>
          );
        }

        /* Chế độ xem thường: y hệt trang chủ — row ngang 14 bài + ô "Xem tất cả" cuối */
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
    </>
  );
}
