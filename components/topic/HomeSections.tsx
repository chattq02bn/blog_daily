"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spin } from "antd";
import { useInView } from "@/hooks/use-in-view";
import { useMainScrollMemory } from "@/hooks/use-main-scroll-memory";
import { usePosts, useSidebarTopicsInfinite } from "@/hooks/use-api";
import TopicSectionView from "@/components/topic/TopicSectionView";
import { postToNote } from "@/lib/api/adapters";
import {
  flattenTopics,
  HOME_SIDEBAR_PAGE_LIMIT,
  HOME_TOPICS_PER_SCROLL,
  sectionPostsParams,
} from "@/lib/sidebar-utils";
import type { ApiSidebarItem } from "@/lib/api";
import styles from "./HomeSections.module.scss";

function SidebarTopicSection({
  item,
  index,
}: {
  item: ApiSidebarItem;
  index: number;
}) {
  const { data, isPending, isError } = usePosts(sectionPostsParams(item));

  const notes = useMemo(() => (data?.data ?? []).map(postToNote), [data]);

  return (
    /* content-visibility + animation giúp cuộn mượt và topic mới hiện ra nhẹ nhàng */
    <section className={`${styles.section} ${index > 0 ? styles.sectionEnter : ""}`}>
      <div className="px-5 sm:px-0">
        {isPending ? (
          <>
            <div className="mb-4 h-8 w-56 animate-pulse rounded-lg bg-surface-quaternary" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="h-64 w-64 shrink-0 animate-pulse rounded-xl bg-surface-quaternary"
                />
              ))}
            </div>
          </>
        ) : isError ? (
          <p className="text-sm text-text-secondary">
            Không tải được bài viết cho mục này.
          </p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-text-secondary">Chưa có bài viết nào.</p>
        ) : (
          /* Layout cũ: header tên + mũi tên phải, row ngang 14 bài + ô "Xem tất cả" */
          <TopicSectionView
            title={item.name}
            description={item.description ?? undefined}
            href={`/topic/${item.slug}`}
            notes={notes}
            featured={index === 0}
          />
        )}
      </div>
    </section>
  );
}

/* Infinite pagination có thể trùng phần ranh giới giữa 2 trang sau khi refetch -> lọc theo id */
function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export default function HomeSections() {
  /* Nhớ vị trí cuộn — back về home không bị văng lên đầu */
  useMainScrollMemory("home");

  /* Giữ icon tối thiểu 600ms mỗi lần nạp để người dùng kịp thấy */
  const spinnerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [spinnerVisible, setSpinnerVisible] = useState(false);

  const handleFetchingStart = useCallback(() => {
    if (spinnerTimer.current) clearTimeout(spinnerTimer.current);
    setSpinnerVisible(true);
  }, []);

  const handleSidebarSettled = useCallback(() => {
    spinnerTimer.current = setTimeout(() => setSpinnerVisible(false), 600);
  }, []);

  /* Topic phân trang từ BE — meta.totalPages cho biết chính xác đã hết data chưa */
  const sidebarQuery = useSidebarTopicsInfinite(HOME_SIDEBAR_PAGE_LIMIT, {
    onStart: handleFetchingStart,
    onSettled: handleSidebarSettled,
  });

  const sections = useMemo(
    () =>
      dedupeById(
        (sidebarQuery.data?.pages ?? []).flatMap((page) => page.data)
      ).flatMap((item) => flattenTopics([item], HOME_TOPICS_PER_SCROLL)),
    [sidebarQuery.data]
  );

  /* Đã hết data <=> BE không còn trang tiếp theo -> icon loading tự ẩn */
  const hasMoreTopics = Boolean(sidebarQuery.hasNextPage);

  /* Dọn timer khi rời trang */
  useEffect(() => {
    return () => {
      if (spinnerTimer.current) clearTimeout(spinnerTimer.current);
    };
  }, []);

  /* Sentinel ở CUỐI TOÀN BỘ LAYOUT: rootMargin lớn để nạp sớm khi user mới cuộn xuống */
  const { ref: sentinelRef, inView: sentinelInView } = useInView<HTMLDivElement>({
    rootMargin: "400px",
    onEnter: () => {
      if (sidebarQuery.hasNextPage && !sidebarQuery.isFetchingNextPage) {
        void sidebarQuery.fetchNextPage();
      }
    },
  });

  if (sidebarQuery.isPending) {
    return (
      <div className="mx-auto min-h-screen animate-pulse px-5 pt-6">
        <div className="h-12 w-56 rounded-xl bg-surface-quaternary" />
        <div className="mt-8 h-64 rounded-2xl bg-surface-quaternary" />
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-40 rounded-xl bg-surface-quaternary" />
          ))}
        </div>
      </div>
    );
  }

  if (sidebarQuery.isError) {
    return (
      <div className="mx-auto min-h-screen px-5 pt-10 text-text-secondary">
        Không tải được danh sách chủ đề. Bạn hãy thử lại sau.
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="mx-auto min-h-screen px-5 pt-10 text-text-secondary">
        Chưa có chủ đề nào được gắn vào sidebar.
      </div>
    );
  }

  return (
    <div className="w-full pt-1">
      {sections.map((item, index) => (
        <SidebarTopicSection key={item.id} item={item} index={index} />
      ))}

      {/* Icon loading toàn layout — chỉ gắn với việc phân trang sidebar,
          BE báo hết trang là tự ẩn, bất kể các section còn đang fetch bài hay lỗi */}
      <div ref={sentinelRef} aria-hidden="true" />
      {(hasMoreTopics && sentinelInView) || spinnerVisible ? (
        <div className={styles.loadingRow}>
          <Spin size="small" />
          <span>Đang tải thêm chủ đề…</span>
        </div>
      ) : null}
    </div>
  );
}
