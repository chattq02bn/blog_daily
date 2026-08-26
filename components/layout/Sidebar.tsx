"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  RightOutlined,
  XOutlined,
  InstagramOutlined,
  FacebookFilled,
} from "@ant-design/icons";
import { Spin } from "antd";
import { useInView } from "@/hooks/use-in-view";
import { useSidebarChildren, useSidebarTopicsInfinite } from "@/hooks/use-api";
import {
  SIDEBAR_CHILDREN_LIMIT,
  SIDEBAR_NAV_PAGE_SIZE,
} from "@/lib/sidebar-utils";
import { sidebarApi, type ApiSidebarItem } from "@/lib/api";
import styles from "./Sidebar.module.scss";

/* Infinite pagination có thể trùng phần ranh giới giữa 2 trang sau khi refetch -> lọc theo id */
function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * Mục con của một topic: hiển thị sẵn phần nhúng từ API (tối đa 10),
 * nếu còn thì bấm "Xem thêm" để call /sidebar/:id/children lấy tiếp 5 mục.
 */
function LazyChildren({
  topic,
  onNavigate,
}: {
  topic: ApiSidebarItem;
  onNavigate?: () => void;
}) {
  const base = topic.children ?? [];
  const [extraChildren, setExtraChildren] = useState<ApiSidebarItem[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiTotal, setApiTotal] = useState<number | null>(null);

  const shown = useMemo(
    () => dedupeById([...base, ...extraChildren]),
    [base, extraChildren]
  );
  const total = apiTotal ?? topic.childrenCount ?? base.length;
  const hiddenCount = Math.max(0, total - shown.length);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await sidebarApi.listChildren(topic.id, {
        offset: shown.length,
        limit: SIDEBAR_CHILDREN_LIMIT,
      });
      setExtraChildren((prev) => {
        const seenIds = new Set(shown.map((item) => item.id));
        return [...prev, ...res.data.filter((child) => !seenIds.has(child.id))];
      });
      setApiTotal(res.total);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <nav className={styles.childNav}>
      {shown.map((child) => (
        <Link
          key={child.id}
          href={`/topic/${child.slug}`}
          className={styles.childLink}
          onClick={onNavigate}
        >
          {child.name}
        </Link>
      ))}

      {hiddenCount > 0 && (
        <button
          type="button"
          className={styles.moreButton}
          onClick={() => void loadMore()}
          disabled={loadingMore}
        >
          {loadingMore ? <Spin size="small" /> : `Xem thêm (${hiddenCount})`}
        </button>
      )}
    </nav>
  );
}

function ParentItem({
  topic,
  onNavigate,
}: {
  topic: ApiSidebarItem;
  onNavigate?: () => void;
}) {
  /* Luôn hiển thị expanded — 5 mục con đầu có sẵn, phần còn lại bấm "Xem thêm" lazy load */
  const totalChildren = topic.childrenCount ?? topic.children.length;

  return (
    <div className={styles.topicItem}>
      <div className={styles.topicRow}>
        <Link
          href={`/topic/${topic.slug}`}
          className={styles.topicParent}
          onClick={onNavigate}
        >
          {topic.name}
        </Link>
        {totalChildren > 0 && (
          <span className={styles.topicToggle}>
            <RightOutlined />
          </span>
        )}
      </div>
      {totalChildren > 0 && <LazyChildren topic={topic} onNavigate={onNavigate} />}
    </div>
  );
}

function TopicList({ onNavigate }: { onNavigate?: () => void }) {
  /* Phân trang từ BE: lần đầu 15 mục cha (kèm tối đa 10 mục con của mỗi mục),
     kéo sát đáy sidebar -> useInView gọi trang tiếp theo */
  const query = useSidebarTopicsInfinite(SIDEBAR_NAV_PAGE_SIZE);

  const items = useMemo(
    () => dedupeById((query.data?.pages ?? []).flatMap((page) => page.data)),
    [query.data]
  );

  const { ref: sentinelRef, inView: sentinelInView } = useInView<HTMLDivElement>({
    rootMargin: "200px",
    onEnter: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    },
  });

  return (
    <nav className={styles.topicGroup}>
      {items.map((topic) => (
        <ParentItem key={topic.id} topic={topic} onNavigate={onNavigate} />
      ))}

      {/* Sentinel cuối danh sách chủ đề trong sidebar */}
      <div ref={sentinelRef} aria-hidden="true" />
      {(query.hasNextPage && sentinelInView) || query.isFetchingNextPage ? (
        <div className="flex justify-center py-3">
          <Spin size="small" />
        </div>
      ) : null}
    </nav>
  );
}

function SnsBox() {
  return (
    <div className={styles.snsBox}>
      <p>Mạng xã hội chính thức của note</p>
      <div className={styles.snsIcons}>
        <a
          href="https://x.com/note_PR"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.snsIcon}
          aria-label="x(Twitter)"
        >
          <XOutlined />
        </a>
        <a
          href="https://www.instagram.com/note_ig_official"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.snsIcon}
          aria-label="instagram"
        >
          <InstagramOutlined />
        </a>
        <a
          href="https://www.facebook.com/note.poc"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.snsIcon}
          aria-label="facebook"
        >
          <FacebookFilled />
        </a>
      </div>
    </div>
  );
}

interface SidebarProps {
  /** desktop: ẩn trên mobile; drawer: hiển thị trong Drawer */
  variant?: "desktop" | "drawer";
  /** Gọi khi người dùng bấm một link (để đóng Drawer) */
  onNavigate?: () => void;
}

export default function Sidebar({
  variant = "desktop",
  onNavigate,
}: SidebarProps) {
  const rootClass =
    variant === "drawer"
      ? "flex w-full flex-col overflow-y-auto"
      : "hidden w-[12.625rem] shrink-0 flex-col overflow-y-auto border-r border-border-default pr-4 lg:flex";

  return (
    <aside className={rootClass}>
      <div className="flex flex-col gap-4">
        <div className="border-b border-border-default pb-4">
          <nav className="flex flex-col gap-1 mt-3">
            <Link
              href="/"
              onClick={onNavigate}
              className={`${styles.navLink} ${styles.navLinkActive}`}
            >
              <span>Trang chủ</span>
            </Link>
          </nav>
          <SnsBox />
        </div>
        <div className="border-b border-border-default pb-4">
          <TopicList onNavigate={onNavigate} />
        </div>
      </div>
    </aside>
  );
}
