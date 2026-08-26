"use client";

import { useEffect } from "react";

/**
 * Nhớ vị trí cuộn của scroll container chính (#main-content) theo key
 * bằng biến trong bộ nhớ module — sống xuyên suốt các lần điều hướng SPA
 * (không dùng sessionStorage). Back/forward về lại trang sẽ được kéo về đúng chỗ.
 */
const memory = new Map<string, number>();

export function useMainScrollMemory(storageKey: string) {
  /* Khôi phục sau khi mount (chốt lại sau 2 frame khi layout đủ chiều cao) */
  useEffect(() => {
    const saved = memory.get(storageKey);
    if (typeof saved !== "number") return;

    const getEl = () =>
      document.getElementById("main-content") as HTMLElement | null;
    const el = getEl();
    if (el) el.scrollTop = saved;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        const target = getEl();
        if (target) target.scrollTop = saved;
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [storageKey]);

  /* Lưu vị trí hiện tại ngay trước khi rời trang */
  useEffect(() => {
    return () => {
      const el = document.getElementById(
        "main-content"
      ) as HTMLElement | null;
      if (el) memory.set(storageKey, el.scrollTop);
    };
  }, [storageKey]);
}
