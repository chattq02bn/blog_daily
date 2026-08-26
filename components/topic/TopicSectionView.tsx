"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import TopicCard, { SeeAllCard } from "./TopicCard";
import type { Note } from "@/lib/view-models";
import styles from "./TopicSectionView.module.scss";

const ITEM_GAP = 16;
const ITEMS_PER_SCROLL = 2;

export default function TopicSectionView({
  title,
  description,
  href,
  notes,
  featured = false,
}: {
  /** Tên topic — hiển thị kèm mũi tên chỉ sang phải */
  title: string;
  description?: string;
  /** Đích của tiêu đề và ô "Xem tất cả" */
  href: string;
  /** Danh sách bài viết đã load (infinite query sẽ nối dài dần) */
  notes: Note[];
  /** Topic đầu tiên dùng card to, các topic sau card nhỏ */
  featured?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [notes.length]);

  /* Section dùng content-visibility: auto — khi được reveal thì kích thước thay đổi
     mà không phát sinh sự kiện resize/scroll, nên phải quan sát bằng ResizeObserver */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => updateArrows());
    observer.observe(el);
    return () => observer.disconnect();
  }, [notes.length]);

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector("a");
    const step = firstCard
      ? (firstCard.getBoundingClientRect().width + ITEM_GAP) * ITEMS_PER_SCROLL
      : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <>
      <div className="mb-1 mt-4">
        <Link href={href} className={`${styles.titleLink} font-bold text-text-primary text-lg ${featured ? "sm:text-xl" : ""}`}>
          <span>{title}</span>
          <span className={styles.titleArrow}>
            <RightOutlined />
          </span>
        </Link>
        {description && (
          <p className="line-clamp-3 text-sm text-text-secondary mt-2">
            {description}
          </p>
        )}
      </div>
      <div className="group relative">
        <button
          type="button"
          aria-label="Xem trước"
          onClick={() => scrollByDir(-1)}
          className={`absolute left-0 top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-surface-normal text-text-primary opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-background-secondary ${canPrev ? "" : "invisible"
            }`}
        >
          <LeftOutlined />
        </button>
        <div
          ref={scrollerRef}
          onScroll={updateArrows}
          className="hidden-scrollbar -mx-4 -my-2 flex overflow-x-auto overflow-y-hidden p-2"
        >
          {notes.map((note) => (
            <TopicCard key={note.id} note={note} featured={featured} />
          ))}
          {/* Ô "Xem tất cả" luôn nằm cuối row */}
          <SeeAllCard href={href} large={featured} />
        </div>
        <button
          type="button"
          aria-label="Xem tiếp"
          onClick={() => scrollByDir(1)}
          className={`absolute right-0 top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-surface-normal text-text-primary opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-background-secondary ${canNext ? "" : "invisible"
            }`}
        >
          <RightOutlined />
        </button>
      </div>
    </>
  );
}
