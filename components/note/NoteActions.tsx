"use client";

import { CommentOutlined, MoreOutlined, ShareAltOutlined } from "@ant-design/icons";
import NoteLike from "./NoteLike";
import styles from "./NoteActions.module.scss";

export default function NoteActions({
  postId,
  likes,
  comments,
}: {
  postId: string;
  likes: number;
  comments: number;
}) {
  return (
    <div className={styles.actionControl}>
      <div className={styles.item}>
        <NoteLike postId={postId} likes={likes} />
      </div>
      <div className={styles.item}>
        <button className={styles.iconButton} aria-label="Bình luận">
          <CommentOutlined />
          <span>{comments.toLocaleString("vi-VN")}</span>
        </button>
      </div>
      <div className={styles.spacer} />
      <div className={styles.item}>
        <button className={styles.iconButton} aria-label="Chia sẻ">
          <ShareAltOutlined />
        </button>
      </div>
      <div className={styles.item}>
        <button className={styles.iconButton} aria-label="Thêm">
          <MoreOutlined />
        </button>
      </div>
    </div>
  );
}