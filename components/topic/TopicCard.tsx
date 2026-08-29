"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RightOutlined, HeartOutlined, HeartFilled, MessageOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postsApi, type LikeState } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import type { Note } from "@/lib/view-models";
import styles from "./TopicCard.module.scss";

const LS_KEY = "note_liked_posts";

function readLikedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function writeLikedSet(ids: Set<string>): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
  } catch {}
}

export default function TopicCard({
  note,
  featured = false,
}: {
  note: Note;
  featured?: boolean;
}) {
  const qc = useQueryClient();
  const [localLiked, setLocalLiked] = useState(false);

  useEffect(() => {
    setLocalLiked(readLikedSet().has(note.id));
  }, [note.id]);

  const { data } = useQuery({
    queryKey: qk.postLike(note.id),
    queryFn: () => postsApi.getLikeState(note.id),
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: () => postsApi.toggleLike(note.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk.postLike(note.id) });
      const previous = qc.getQueryData<LikeState>(qk.postLike(note.id));
      qc.setQueryData<LikeState>(qk.postLike(note.id), (old) => {
        if (!old) return { isLiked: true, likeCount: 1 };
        return { isLiked: !old.isLiked, likeCount: old.likeCount + (!old.isLiked ? 1 : -1) };
      });
      return { previous };
    },
    onSuccess: (result) => {
      qc.setQueryData<LikeState>(qk.postLike(note.id), result);
      const ids = readLikedSet();
      if (result.isLiked) ids.add(note.id);
      else ids.delete(note.id);
      writeLikedSet(ids);
      setLocalLiked(result.isLiked);
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData<LikeState>(qk.postLike(note.id), context.previous);
      const ids = readLikedSet();
      ids.delete(note.id);
      writeLikedSet(ids);
      setLocalLiked(false);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: qk.postLike(note.id) });
    },
  });

  const isLiked = data?.isLiked ?? localLiked;
  const displayLikes = data?.likeCount ?? note.likes;

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mutation.isPending) mutation.mutate();
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
      <div className={styles.likeRow}>
        <button
          type="button"
          className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
          onClick={toggleLike}
          aria-label="Thích bài viết"
          aria-pressed={isLiked}
        >
          {isLiked ? <HeartFilled /> : <HeartOutlined />}
          <span>{displayLikes.toLocaleString("vi-VN")}</span>
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
