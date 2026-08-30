import { useEffect, useState } from "react";

/**
 * Trả về giá trị debounced — input mượt vì chỉ setState 1 lần,
 * không gây re-render thừa.
 */
export function useDebouncedValue(value: string, delay = 300): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
