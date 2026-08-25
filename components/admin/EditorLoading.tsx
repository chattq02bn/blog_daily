"use client";

import styles from "./EditorLoading.module.scss";

export default function EditorLoading() {
  return (
    <div className={styles.loading} role="status" aria-label="Đang tải nội dung">
      <span className={styles.dots}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </span>
    </div>
  );
}
