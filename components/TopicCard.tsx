import Image from "next/image";
import Link from "next/link";
import { RightOutlined } from "@ant-design/icons";
import type { Note } from "@/data/notes";
import styles from "./TopicCard.module.scss";

export default function TopicCard({
  note,
  featured = false,
}: {
  note: Note;
  featured?: boolean;
}) {
  return (
    <Link href={`/note/${note.id}`} className={featured ? styles.featured : styles.card}>
      <div className={styles.cover}>
        <Image
          src={note.cover}
          alt={note.title}
          fill
          sizes="(max-width: 640px) 16rem, 22rem"
        />
      </div>
      <h3
        className={`mt-3 line-clamp-2 font-bold text-text-primary ${
          featured ? "text-lg" : "text-sm"
        }`}
      >
        {note.title}
      </h3>
      {featured && (
        <p className="mt-2 line-clamp-2 text-xs text-text-secondary sm:text-sm">
          {note.excerpt}
        </p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <Image
          src={note.avatar}
          alt={note.author}
          width={24}
          height={24}
          className="size-6 shrink-0 rounded-full"
          style={{ objectFit: "cover" }}
        />
        <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">
          {note.author}
        </span>
      </div>
    </Link>
  );
}

export function SeeAllCard({ href, large = false }: { href: string; large?: boolean }) {
  return (
    <Link href={href} className={large ? styles.seeAllLarge : styles.seeAll}>
      <div className={styles.seeAllBox}>
        <span>Xem tất cả</span>
        <RightOutlined style={{ fontSize: 20, color: "var(--color-text-clickable-icon)" }} />
      </div>
    </Link>
  );
}