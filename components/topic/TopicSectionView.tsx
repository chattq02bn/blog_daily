"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import TopicCard, { SeeAllCard } from "./TopicCard";
import type { TopicSection } from "@/data/notes";
import styles from "./TopicSectionView.module.scss";

const MAX_NOTES = 10;
const ITEM_GAP = 16;
const ITEMS_PER_SCROLL = 2;

export default function TopicSectionView({
  section,
  variant = "small",
}: {
  section: TopicSection;
  variant?: "large" | "small";
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
  }, []);

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector("a");
    const step = firstCard
      ? (firstCard.getBoundingClientRect().width + ITEM_GAP) * ITEMS_PER_SCROLL
      : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const visibleNotes = section.notes.slice(0, MAX_NOTES);
  const showSeeAll = section.notes.length > MAX_NOTES;
  const featured = variant === "large";

  return (
    <section className="mb-5">
      <div className="px-5 sm:px-0">
        <div className="mb-4">
          <Link
            href={`${section.href}?s=${encodeURIComponent(section.id)}`}
            className={`${styles.titleLink} font-bold text-text-primary ${
              featured ? "text-xl" : "text-lg"
            }`}
          >
            <span>{section.title}</span>
            <span className={styles.titleArrow}>
              <RightOutlined />
            </span>
          </Link>
          {section.description && (
            <p className="mt-2 line-clamp-3 text-sm text-text-secondary sm:mt-4">
              {section.description}
            </p>
          )}
        </div>
        <div className="group relative">
          <button
            type="button"
            aria-label="Xem trước"
            onClick={() => scrollByDir(-1)}
            className={`absolute left-0 top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-surface-normal text-text-primary opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-background-secondary ${
              canPrev ? "" : "invisible"
            }`}
          >
            <LeftOutlined />
          </button>
          <div
            ref={scrollerRef}
            onScroll={updateArrows}
            className="hidden-scrollbar -mx-4 -my-2 flex overflow-x-auto overflow-y-hidden p-2"
          >
            {visibleNotes.map((note) => (
              <TopicCard key={note.id} note={note} featured={featured} />
            ))}
            {showSeeAll && <SeeAllCard href={section.href} large={featured} />}
          </div>
          <button
            type="button"
            aria-label="Xem tiếp"
            onClick={() => scrollByDir(1)}
            className={`absolute right-0 top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-surface-normal text-text-primary opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-background-secondary ${
              canNext ? "" : "invisible"
            }`}
          >
            <RightOutlined />
          </button>
        </div>
      </div>
    </section>
  );
}
