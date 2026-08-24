"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RightOutlined,
  XOutlined,
  InstagramOutlined,
  FacebookFilled,
} from "@ant-design/icons";
import { topics } from "@/data/notes";
import styles from "./Sidebar.module.scss";

const CHILD_LIMIT = 10;

function TopicChildren({ children }: { children: string[] }) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? children : children.slice(0, CHILD_LIMIT);

  return (
    <nav className={styles.childNav}>
      {visible.map((child) => (
        <Link
          key={child}
          href={`/tag/${encodeURIComponent(child)}`}
          className={styles.childLink}
        >
          {child}
        </Link>
      ))}
      {children.length > CHILD_LIMIT && !expanded && (
        <button
          type="button"
          className={styles.moreButton}
          onClick={() => setExpanded(true)}
        >
          Xem thêm ({children.length - CHILD_LIMIT})
        </button>
      )}
    </nav>
  );
}

function TopicList() {
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (title: string) => {
    setCollapsedTopics((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <nav className={styles.topicGroup}>
      {topics.map((topic) => {
        const isOpen = !collapsedTopics[topic.title];
        return (
          <div key={topic.title} className={styles.topicItem}>
            <div className={styles.topicRow}>
              <Link href={topic.href} className={styles.topicParent}>
                {topic.title}
              </Link>
              <button
                type="button"
                className={`${styles.topicToggle} ${isOpen ? styles.topicToggleOpen : ""}`}
                onClick={() => toggleTopic(topic.title)}
                aria-expanded={isOpen}
                aria-label={`${isOpen ? "Đóng" : "Mở"} ${topic.title}`}
              >
                <RightOutlined />
              </button>
            </div>
            {isOpen && <TopicChildren>{topic.children}</TopicChildren>}
          </div>
        );
      })}
    </nav>
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
    <aside className="hidden w-[12.625rem] shrink-0 flex-col overflow-y-auto border-r border-border-default pr-4 lg:flex">
      <div className="flex flex-col gap-4">
        <div className="border-b border-border-default pb-4">
          <SnsBox />
          <nav className="flex flex-col gap-1 mt-3">
            <Link href="/" className={`${styles.navLink} ${styles.navLinkActive}`}>
              <span>Trang chủ</span>
            </Link>
          </nav>
        </div>
        <div className="border-b border-border-default pb-4">
          <TopicList />
        </div>
      </div>
    </aside>
  );
}
