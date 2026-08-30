"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input, Spin } from "antd";
import { FaSearch, FaFileAlt, FaClock, FaTimes } from "react-icons/fa";
import { useSearchPosts } from "@/hooks/use-search-posts";
import styles from "./SearchPopover.module.scss";

const HISTORY_KEY = "search_history";
const MAX_HISTORY = 10;

function getHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(q: string) {
  const trimmed = q.trim();
  if (!trimmed) return;
  const history = getHistory().filter((h) => h !== trimmed);
  history.unshift(trimmed);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function removeHistoryItem(q: string) {
  const history = getHistory().filter((h) => h !== q);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function highlightMatch(text: string, q: string) {
  if (!q.trim()) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span key={i} className={styles.highlight}>{part}</span>
    ) : (
      part
    ),
  );
}

export default function SearchPopover() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [history, setHistory] = useState<string[]>(() => getHistory());
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, enabled } = useSearchPosts(query);

  const hasResults = results.length > 0;
  const showNoResults = !isLoading && enabled && !hasResults && query.trim().length >= 2;
  const showHistory = !enabled && history.length > 0;

  const addHistory = useCallback((q: string) => {
    saveHistory(q);
    setHistory(getHistory());
  }, []);

  const deleteHistory = useCallback((q: string) => {
    removeHistoryItem(q);
    setHistory(getHistory());
  }, []);

  const handleSelectResult = useCallback(
    (slug: string) => {
      addHistory(query);
      setOpen(false);
      setQuery("");
      router.push(`/note/${slug}`);
    },
    [query, addHistory, router],
  );

  const handleSelectHistory = useCallback((q: string) => {
    setQuery(q);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        handleSelectResult(results[activeIndex].slug);
      } else if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    },
    [open, results, activeIndex, handleSelectResult],
  );

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <Input
        ref={inputRef as never}
        prefix={<FaSearch style={{ color: "var(--color-text-clickable-icon)" }} />}
        placeholder="Tìm kiếm bài viết..."
        variant="filled"
        allowClear
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(-1);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={styles.input}
      />

      {open && (
        <div className={styles.dropdown}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <Spin size="small" />
              <span>Đang tìm kiếm...</span>
            </div>
          ) : hasResults ? (
            <>
              <div className={styles.dropdownHeader}>Kết quả ({results.length})</div>
              <div className={styles.resultsList}>
                {results.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/note/${post.slug}`}
                    className={styles.resultItem}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelectResult(post.slug);
                    }}
                    tabIndex={-1}
                  >
                    <Image
                      src={post.cover}
                      alt=""
                      width={72}
                      height={48}
                      className={styles.resultCover}
                      loading="lazy"
                    />
                    <div className={styles.resultInfo}>
                      <div className={styles.resultTitle}>
                        {highlightMatch(post.title, query)}
                      </div>
                      {post.excerpt && (
                        <div className={styles.resultExcerpt}>
                          {highlightMatch(post.excerpt, query)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : showNoResults ? (
            <div className={styles.noResults}>
              <FaFileAlt style={{ fontSize: 24, marginBottom: 8, display: "block" }} />
              Không tìm thấy bài viết nào với từ khóa &ldquo;{query}&rdquo;
            </div>
          ) : showHistory ? (
            <>
              <div className={styles.dropdownHeader}>Lịch sử tìm kiếm</div>
              <div className={styles.resultsList}>
                {history.map((q) => (
                  <div
                    key={q}
                    className={styles.historyItem}
                    onClick={() => handleSelectHistory(q)}
                  >
                    <FaClock className={styles.historyIcon} />
                    <span className={styles.historyText}>{q}</span>
                    <button
                      type="button"
                      className={styles.historyDelete}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHistory(q);
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>Vui lòng nhập từ khóa để tìm kiếm</div>
          )}
        </div>
      )}
    </div>
  );
}
