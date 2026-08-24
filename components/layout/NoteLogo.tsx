"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProfile, PROFILE_CHANGED_EVENT } from "@/lib/profileStorage";
import styles from "./NoteLogo.module.scss";

export default function NoteLogo() {
  const [logoName, setLogoName] = useState("note");

  useEffect(() => {
    const sync = () => setLogoName(loadProfile().logoName || "note");
    sync();
    window.addEventListener(PROFILE_CHANGED_EVENT, sync);
    return () => window.removeEventListener(PROFILE_CHANGED_EVENT, sync);
  }, []);

  return (
    <Link href="/" className={styles.logo} aria-label={logoName}>
      <span className={styles.mark}>{logoName.charAt(0).toLowerCase() || "n"}</span>
      <span className={styles.word}>{logoName}</span>
    </Link>
  );
}
