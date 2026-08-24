"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { RightOutlined, HeartOutlined, HeartFilled } from "@ant-design/icons";
import type { Note } from "@/data/notes";
import styles from "./TopicCard.module.scss";

const LIKED_KEY = "note_card_likes";

function getLikedMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LIKED_KEY) || "{}");
  } catch {
    return {};
  }
}

const likeListeners = new Set<() => void>();

function subscribeLikes(callback: () => void) {
  likeListeners.add(callback);
  return () => {
    likeListeners.delete(callback);
  };
}

function emitLikeChange() {
  likeListeners.forEach((listener) => listener());
}

function useLiked(noteId: string): boolean {
  return useSyncExternalStore(
    subscribeLikes,
    () => !!getLikedMap()[noteId],
    () => false
  );
}

export default function TopicCard({
  note,
  featured = false,
}: {
  note: Note;
  featured?: boolean;
}) {
  const liked = useLiked(note.id);

  const displayLikes = note.likes + (liked ? 1 : 0);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const map = getLikedMap();
    if (map[note.id]) delete map[note.id];
    else map[note.id] = true;
    localStorage.setItem(LIKED_KEY, JSON.stringify(map));
    emitLikeChange();
  };

  return (
    <Link href={`/note/${note.id}`} className={featured ? styles.featured : styles.card}>
      <div className={styles.cover}>
        <Image
          src={note.cover}
          alt={note.title}
          fill
          sizes="(max-width: 640px) 16rem, 22rem"
        />
      </div>
      <h3
        className={`mt-3 line-clamp-2 font-bold text-text-primary ${
          featured ? "text-lg" : "text-sm"
        }`}
      >
        {note.title}
      </h3>
      <div className="mt-3 flex items-center gap-2">
        <Image
          src={note.avatar}
          alt={note.author}
          width={24}
          height={24}
          className="size-6 shrink-0 rounded-full"
          style={{ objectFit: "cover" }}
        />
        <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">
          {note.author}
        </span>
      </div>
      <div className={styles.likeRow}>
        <button
          type="button"
          className={`${styles.likeButton} ${liked ? styles.liked : ""}`}
          onClick={toggleLike}
          aria-label="Thích bài viết"
        >
          {liked ? <HeartFilled /> : <HeartOutlined />}
          <span>{displayLikes.toLocaleString("vi-VN")}</span>
        </button>
      </div>
    </Link>
  );
}

export function SeeAllCard({ href, large = false }: { href: string; large?: boolean }) {
  return (
    <Link href={href} className={large ? styles.seeAllLarge : styles.seeAll}>
      <div className={styles.seeAllBox}>
        <span>Xem tất cả</span>
        <RightOutlined style={{ fontSize: 20, color: "var(--color-text-clickable-icon)" }} />
      </div>
    </Link>
  );
}