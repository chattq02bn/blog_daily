"use client";

import { useCallback, useState } from "react";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { commentsApi } from "@/lib/api";
import { setCommentLiked } from "@/lib/comment-likes";
import { useIsCommentLiked } from "@/components/likes/CommentLikesProvider";
import styles from "./CommentLikeButton.module.scss";

export default function CommentLikeButton({ commentId, likes }: { commentId: string; likes: number }) {
  const isLiked = useIsCommentLiked(commentId);
  const [likeCount, setLikeCount] = useState(likes);

  const mutation = useMutation({
    mutationFn: () => commentsApi.toggleLike(commentId),
    onMutate: async () => {
      setLikeCount((prev) => prev + (isLiked ? -1 : 1));
    },
    onSuccess: (result) => {
      setLikeCount(result.likeCount);
      setCommentLiked(commentId, result.isLiked);
    },
    onError: () => {
      setLikeCount(likes);
    },
  });

  const toggle = useCallback(() => {
    if (!mutation.isPending) mutation.mutate();
  }, [mutation]);

  return (
    <button
      className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
      onClick={toggle}
      disabled={mutation.isPending}
      aria-pressed={isLiked}
      aria-label="Thích bình luận"
    >
      {isLiked ? <HeartFilled /> : <HeartOutlined />}
      {likeCount > 0 && (
        <span className={styles.likeCount}>{likeCount}</span>
      )}
    </button>
  );
}
