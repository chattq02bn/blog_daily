"use client";

import { useState, useMemo, useCallback } from "react";
import { Select } from "antd";
import { debounce } from "lodash";
import { useSidebarSelect } from "@/hooks/use-api";

interface SidebarSelectOption {
  value: string;
  label: string;
}

interface SidebarSelectProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
  extraOptions?: SidebarSelectOption[];
  popupRender?: (menu: React.ReactElement) => React.ReactElement;
  notFoundContent?: React.ReactNode;
}

export default function SidebarSelect({
  value,
  onChange,
  placeholder = "Chọn sidebar",
  allowClear = false,
  disabled = false,
  className,
  extraOptions,
  popupRender,
  notFoundContent,
}: SidebarSelectProps) {
  const [searchText, setSearchText] = useState("");

  const debouncedSetSearch = useMemo(
    () => debounce((v: string) => setSearchText(v), 300),
    [],
  );

  const handleSearch = useCallback(
    (value: string) => {
      debouncedSetSearch(value);
    },
    [debouncedSetSearch],
  );

  const sidebarSelect = useSidebarSelect(10, searchText || undefined);

  const options = useMemo(() => {
    const opts = sidebarSelect.items.map((item) => ({
      value: item.id,
      label: item.isChild ? `\u00A0\u00A0${item.name}` : item.name,
    }));
    if (extraOptions?.length) {
      for (const extra of extraOptions) {
        if (!opts.some((o) => o.value === extra.value)) {
          opts.unshift(extra);
        }
      }
    }
    return opts;
  }, [sidebarSelect.items, extraOptions]);

  const handlePopupScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      if (
        target.scrollTop + target.offsetHeight >= target.scrollHeight - 20 &&
        sidebarSelect.hasNextPage &&
        !sidebarSelect.isFetchingNextPage
      ) {
        void sidebarSelect.fetchNextPage();
      }
    },
    [sidebarSelect.hasNextPage, sidebarSelect.isFetchingNextPage, sidebarSelect.fetchNextPage],
  );

  const defaultNotFound = sidebarSelect.isPending
    ? "Đang tải..."
    : "Không có dữ liệu";

  return (
    <Select
      showSearch
      placeholder={placeholder}
      optionFilterProp="label"
      allowClear={allowClear}
      disabled={disabled}
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      options={options}
      notFoundContent={notFoundContent ?? defaultNotFound}
      className={className}
      onPopupScroll={handlePopupScroll}
      popupRender={
        popupRender ??
        ((menu) => (
          <>
            {menu}
            {sidebarSelect.isFetchingNextPage && (
              <div
                style={{
                  textAlign: "center",
                  padding: "8px 0",
                  color: "#999",
                  fontSize: 12,
                }}
              >
                Đang tải thêm...
              </div>
            )}
          </>
        ))
      }
    />
  );
}
