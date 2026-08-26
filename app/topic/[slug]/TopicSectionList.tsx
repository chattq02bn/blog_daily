"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RightOutlined } from "@ant-design/icons";
import { useSections, useSectionsBySlugs } from "@/hooks/use-api";
import TopicCard from "@/components/topic/TopicCard";
import TopicSectionView from "@/components/topic/TopicSectionView";
import { postToNote } from "@/lib/api/adapters";
import styles from "./topic.module.scss";

const MAX_NOTES = 14;

export default function TopicSectionList({
  slug,
  childrenSlugs,
}: {
  slug: string;
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

  const totalNotes = data.reduce((sum, section) => sum + section.posts.length, 0);

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

      {data.map((section, index) => {
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
    </>
  );
}
