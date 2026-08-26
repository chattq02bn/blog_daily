"use client";

import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { useIsPostLiked } from "@/components/likes/LikesProvider";
import { togglePostLiked } from "@/lib/post-likes";
import styles from "./NoteLike.module.scss";

export default function NoteLike({ postId, likes }: { postId: string; likes: number }) {
  // Trạng thái like được lưu ở localStorage + cookie nên giữ nguyên sau khi F5
  const liked = useIsPostLiked(postId);
  const count = likes + (liked ? 1 : 0);

  const toggle = () => togglePostLiked(postId);

  return (
    <span className={styles.like}>
      <span className={`${styles.iconContainer} ${liked ? styles.liked : ""}`}>
        <button
          onClick={toggle}
          aria-pressed={liked}
          aria-label="Thích bài viết"
          className={styles.iconButton}
        >
          {liked ? <HeartFilled /> : <HeartOutlined />}
        </button>
      </span>
      <button onClick={toggle} className={styles.count}>
        {count.toLocaleString("vi-VN")}
      </button>
    </span>
  );
}
