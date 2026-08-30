"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

/**
 * Search input tách riêng khỏi page — parent chỉ nhận callback
 * khi giá trị đã debounce (mặc định 300ms).
 *
 * Input value là local state → gõ mượt, không gây re-render cha.
 */
const SearchInput = memo(function SearchInput({
  placeholder,
  onSearch,
  className,
  debounceMs = 300,
}: {
  placeholder: string;
  onSearch: (value: string) => void;
  className?: string;
  debounceMs?: number;
}) {
  const [value, setValue] = useState("");

  const stableOnSearch = useCallback(onSearch, [onSearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      stableOnSearch(value.trim());
    }, debounceMs);
    return () => clearTimeout(t);
  }, [value, debounceMs, stableOnSearch]);

  return (
    <Input
      prefix={
        <SearchOutlined
          style={{ color: "var(--color-text-clickable-icon)" }}
        />
      }
      placeholder={placeholder}
      allowClear
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={className}
    />
  );
});

export default SearchInput;
