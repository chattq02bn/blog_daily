"use client";

import { useState } from "react";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import styles from "./NoteLike.module.scss";

export default function NoteLike({ likes }: { likes: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likes);

  const toggle = () => {
    if (liked) {
      setCount((c) => c - 1);
    } else {
      setCount((c) => c + 1);
    }
    setLiked(!liked);
  };

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
        {count.toLocaleString()}
      </button>
    </span>
  );
}