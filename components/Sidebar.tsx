"use client";

import Link from "next/link";
import {
  RightOutlined,
  XOutlined,
  InstagramOutlined,
  FacebookFilled,
} from "@ant-design/icons";
import { trendingTags, topics, sidebarFooterLinks } from "@/data/notes";
import styles from "./Sidebar.module.scss";

function TrendList() {
  return (
    <section>
      <Link href="/trend" className={styles.heading}>
        Xu hướng
      </Link>
      <ol>
        {trendingTags.map((t) => (
          <li key={t.rank}>
            <Link href={t.href} className={styles.trendItem}>
              <span className={styles.trendRank} aria-label={String(t.rank)}>
                {t.rank}
              </span>
              <span className="truncate">{t.name}</span>
            </Link>
          </li>
        ))}
      </ol>
      <Link href="/trend" className={styles.smallLink}>
        <span className="mt-1 block">Xem thêm</span>
      </Link>
    </section>
  );
}

function TopicList() {
  return (
    <div className="flex flex-col gap-4 px-2">
      {topics.map((topic) => (
        <div key={topic.title} className="flex flex-col">
          <div className={styles.topicHeader}>
            <span className={styles.topicTitle}>{topic.title}</span>
            <RightOutlined style={{ fontSize: 16 }} />
          </div>
          <nav className="flex flex-col gap-1">
            {topic.children.map((child) => (
              <Link
                key={child}
                href={`/tag/${encodeURIComponent(child)}`}
                className={styles.smallLink}
              >
                {child}
              </Link>
            ))}
          </nav>
        </div>
      ))}
    </div>
  );
}

function SnsBox() {
  return (
    <div className={styles.snsBox}>
      <p>Mạng xã hội chính thức của note</p>
      <div className={styles.snsIcons}>
        <a
          href="https://x.com/note_PR"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.snsIcon}
          aria-label="x(Twitter)"
        >
          <XOutlined />
        </a>
        <a
          href="https://www.instagram.com/note_ig_official"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.snsIcon}
          aria-label="instagram"
        >
          <InstagramOutlined />
        </a>
        <a
          href="https://www.facebook.com/note.poc"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.snsIcon}
          aria-label="facebook"
        >
          <FacebookFilled />
        </a>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden w-[11.375rem] shrink-0 flex-col overflow-y-auto border-r border-border-default pr-4 lg:flex">
      <div className="flex flex-col gap-4">
        <div className="border-b border-border-default pb-4">
          <nav className="flex flex-col gap-1">
            <Link href="/" className={`${styles.navLink} ${styles.navLinkActive}`}>
              <span>Trang chủ</span>
            </Link>
            <Link href="/trend" className={styles.navLink}>
              <span>Xu hướng</span>
            </Link>
            <Link href="/mypage" className={styles.navLink}>
              <span>Trang cá nhân</span>
            </Link>
            <Link href="/magazines" className={styles.navLink}>
              <span>Tạp chí</span>
            </Link>
            <Link href="/salons" className={styles.navLink}>
              <span>Vòng tròn</span>
            </Link>
          </nav>
        </div>
        <div className="border-b border-border-default pb-4">
          <TrendList />
        </div>
        <div className="border-b border-border-default pb-4">
          <Link href="/topic/challenge" className={styles.navLink}>
            <span>Thử thách</span>
            <RightOutlined
              style={{ fontSize: 24, color: "var(--color-text-clickable-icon)" }}
            />
          </Link>
          <TopicList />
        </div>
        <div className="border-b border-border-default pb-4">
          <SnsBox />
        </div>
        <nav className={styles.footerLinks}>
          {sidebarFooterLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
