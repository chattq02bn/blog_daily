"use client";

import { useCallback, useEffect, useState } from "react";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postsApi, type LikeState } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import styles from "@/components/note/NoteLike.module.scss";

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

export default function LikeButton({ postId }: { postId: string }) {
  const qc = useQueryClient();
  const [localLiked, setLocalLiked] = useState(false);

  useEffect(() => {
    setLocalLiked(readLikedSet().has(postId));
  }, [postId]);

  const { data } = useQuery({
    queryKey: qk.postLike(postId),
    queryFn: () => postsApi.getLikeState(postId),
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: () => postsApi.toggleLike(postId),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk.postLike(postId) });
      const previous = qc.getQueryData<LikeState>(qk.postLike(postId));

      qc.setQueryData<LikeState>(qk.postLike(postId), (old) => {
        if (!old) return { isLiked: true, likeCount: 1 };
        return {
          isLiked: !old.isLiked,
          likeCount: old.likeCount + (!old.isLiked ? 1 : -1),
        };
      });

      return { previous };
    },
    onSuccess: (result) => {
      qc.setQueryData<LikeState>(qk.postLike(postId), result);
      const ids = readLikedSet();
      if (result.isLiked) ids.add(postId);
      else ids.delete(postId);
      writeLikedSet(ids);
      setLocalLiked(result.isLiked);
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData<LikeState>(qk.postLike(postId), context.previous);
      }
      const ids = readLikedSet();
      ids.delete(postId);
      writeLikedSet(ids);
      setLocalLiked(false);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: qk.postLike(postId) });
    },
  });

  const toggle = useCallback(() => {
    if (!mutation.isPending) mutation.mutate();
  }, [mutation]);

  const isLiked = data?.isLiked ?? localLiked;
  const likeCount = data?.likeCount ?? 0;

  return (
    <span className={styles.like}>
      <span className={`${styles.iconContainer} ${isLiked ? styles.liked : ""}`}>
        <button
          onClick={toggle}
          disabled={mutation.isPending}
          aria-pressed={isLiked}
          aria-label="Thích bài viết"
          className={styles.iconButton}
        >
          {isLiked ? <HeartFilled /> : <HeartOutlined />}
        </button>
      </span>
      <span className={styles.count}>
        {likeCount.toLocaleString("vi-VN")}
      </span>
    </span>
  );
}
