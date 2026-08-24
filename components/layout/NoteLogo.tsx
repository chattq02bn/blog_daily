import Link from "next/link";
import styles from "./NoteLogo.module.scss";

export default function NoteLogo() {
  return (
    <Link href="/" className={styles.logo} aria-label="note">
      <span className={styles.mark}>n</span>
      <span className={styles.word}>note</span>
    </Link>
  );
}
