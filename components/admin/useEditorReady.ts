"use client";

import { useEffect, useRef, useState } from "react";

export function useEditorReady<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = requestAnimationFrame(function check() {
      if (el.querySelector(".bn-container")) {
        setReady(true);
      } else {
        raf = requestAnimationFrame(check);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return { ref, ready };
}
