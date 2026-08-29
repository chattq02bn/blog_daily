"use client";

import { useCallback, useState } from "react";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { postsApi } from "@/lib/api";
import { setPostLiked } from "@/lib/post-likes";
import { useIsPostLiked } from "@/components/likes/LikesProvider";
import styles from "@/components/note/NoteLike.module.scss";

export default function LikeButton({ postId, likes }: { postId: string; likes: number }) {
  const isLiked = useIsPostLiked(postId);
  const [likeCount, setLikeCount] = useState(likes);

  const mutation = useMutation({
    mutationFn: () => postsApi.toggleLike(postId),
    onMutate: async () => {
      setLikeCount((prev) => prev + (isLiked ? -1 : 1));
    },
    onSuccess: (result) => {
      setLikeCount(result.likeCount);
      setPostLiked(postId, result.isLiked);
    },
    onError: () => {
      setLikeCount(likes);
    },
  });

  const toggle = useCallback(() => {
    if (!mutation.isPending) mutation.mutate();
  }, [mutation]);

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
