"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseInViewOptions extends IntersectionObserverInit {
  /** true = chỉ báo hiệu một lần (phần tử đã hiện ra thì ngừng quan sát) */
  once?: boolean;
  /** Gọi khi phần tử đi vào viewport (bên trong observer callback) */
  onEnter?: () => void;
}

/**
 * Theo dõi phần tử có nằm trong viewport hay không — dùng cho infinite scroll.
 * Dùng callback ref để tự observe lại khi node thay đổi (vd: danh sách render dần).
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: UseInViewOptions
) {
  const { once = false, root = null, rootMargin, threshold, onEnter } = options ?? {};
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const onEnterRef = useRef(onEnter);

  /* Giữ callback mới nhất mà không phải tạo lại observer */
  useEffect(() => {
    onEnterRef.current = onEnter;
  });

  const ref = useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node || typeof IntersectionObserver === "undefined") return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry!.isIntersecting) {
            setInView(true);
            onEnterRef.current?.();
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        },
        { root, rootMargin, threshold }
      );
      observer.observe(node);
      observerRef.current = observer;
    },
    [once, root, rootMargin, threshold]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { ref, inView };
}
