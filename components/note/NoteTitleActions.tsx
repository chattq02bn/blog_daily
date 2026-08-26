"use client";

import { MoreOutlined, ShareAltOutlined } from "@ant-design/icons";
import NoteLike from "./NoteLike";
import styles from "./NoteTitleActions.module.scss";

export default function NoteTitleActions({ postId, likes }: { postId: string; likes: number }) {
  return (
    <div className={styles.row}>
      <NoteLike postId={postId} likes={likes} />
      <div className={styles.actions}>
        <button className={styles.iconButton} aria-label="Chia sẻ">
          <ShareAltOutlined />
        </button>
        <button className={styles.iconButton} aria-label="Thêm">
          <MoreOutlined />
        </button>
      </div>
    </div>
  );
}