"use client";

import Link from "next/link";
import { useProfile } from "@/hooks/use-api";
import styles from "./NoteLogo.module.scss";

export default function NoteLogo() {
  const { data: profile } = useProfile();
  const logoName = profile?.logoName || "note";

  return (
    <Link href="/" className={styles.logo} aria-label={logoName}>
      <span className={styles.mark}>{logoName.charAt(0).toLowerCase() || "n"}</span>
      <span className={styles.word}>{logoName}</span>
    </Link>
  );
}
