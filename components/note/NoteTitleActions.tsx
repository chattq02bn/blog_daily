"use client";

import { ShareAltOutlined } from "@ant-design/icons";
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
      </div>
    </div>
  );
}