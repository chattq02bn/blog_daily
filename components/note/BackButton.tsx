"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftOutlined } from "@ant-design/icons";
import styles from "@/app/note/[id]/note.module.scss";

export default function BackButton({ label = "Quay lại" }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={styles.backButton}
      onClick={() => router.back()}
    >
      <ArrowLeftOutlined />
      <span>{label}</span>
    </button>
  );
}
