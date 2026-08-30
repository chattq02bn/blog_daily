"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RightOutlined, HeartOutlined, HeartFilled, MessageOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { postsApi } from "@/lib/api";
import { setPostLiked } from "@/lib/post-likes";
import { useIsPostLiked } from "@/components/likes/LikesProvider";
import NoImage from "@/components/ui/NoImage";
import type { Note } from "@/lib/view-models";
import styles from "./TopicCard.module.scss";

export default function TopicCard({
  note,
  featured = false,
}: {
  note: Note;
  featured?: boolean;
}) {
  const isLiked = useIsPostLiked(note.id);
  const [likeCount, setLikeCount] = useState(note.likes);

  const mutation = useMutation({
    mutationFn: () => postsApi.toggleLike(note.id),
    onMutate: async () => {
      setLikeCount((prev) => prev + (isLiked ? -1 : 1));
    },
    onSuccess: (result) => {
      setLikeCount(result.likeCount);
      setPostLiked(note.id, result.isLiked);
    },
    onError: () => {
      setLikeCount(note.likes);
    },
  });

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mutation.isPending) mutation.mutate();
  };

  return (
    <Link href={`/note/${note.id}`} className={featured ? styles.featured : styles.card}>
      <div className={styles.cover}>
        {note.cover ? (
          <Image
            src={note.cover}
            alt={note.title}
            fill
            sizes="(max-width: 640px) 16rem, 22rem"
          />
        ) : (
          <NoImage />
        )}
      </div>
      <h3
        className={`mt-3 line-clamp-2 font-bold text-text-primary ${
          featured ? "text-lg" : "text-sm"
        }`}
      >
        {note.title}
      </h3>
      <div className={styles.likeRow}>
        <button
          type="button"
          className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
          onClick={toggleLike}
          aria-label="Thích bài viết"
          aria-pressed={isLiked}
        >
          {isLiked ? <HeartFilled /> : <HeartOutlined />}
          <span>{likeCount.toLocaleString("vi-VN")}</span>
        </button>
        <span className={styles.commentCount}>
          <MessageOutlined />
          <span>{note.comments.toLocaleString("vi-VN")}</span>
        </span>
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
