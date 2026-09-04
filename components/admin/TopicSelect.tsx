"use client";

import { useState, useMemo, useCallback } from "react";
import { Select } from "antd";
import { debounce } from "lodash";
import { useInfiniteQuery } from "@tanstack/react-query";
import { topicsApi } from "@/lib/api";
import type { ApiTopic } from "@/lib/api";

interface TopicSelectProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  allowClear?: boolean;
  mode?: "multiple" | undefined;
  disabled?: boolean;
  className?: string;
  sidebarId?: string | null;
  extraOptions?: { value: string; label: string }[];
}

export default function TopicSelect({
  value,
  onChange,
  placeholder = "Chọn topic",
  allowClear = false,
  mode,
  disabled = false,
  className,
  sidebarId,
  extraOptions,
}: TopicSelectProps) {
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

  const topicsQuery = useInfiniteQuery({
    queryKey: ["topics", "select", sidebarId ?? "", searchText],
    queryFn: ({ pageParam }) =>
      topicsApi.list({
        page: pageParam as number,
        limit: 10,
        q: searchText || undefined,
        sidebarId: sidebarId || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
  });

  const items = useMemo(() => {
    const result: ApiTopic[] = [];
    for (const page of topicsQuery.data?.pages ?? []) {
      result.push(...page.data);
    }
    return result;
  }, [topicsQuery.data]);

  const options = useMemo(() => {
    const opts = items.map((item) => ({
      value: item.id,
      label: item.name,
    }));
    if (extraOptions?.length) {
      for (const extra of extraOptions) {
        if (!opts.some((o) => o.value === extra.value)) {
          opts.unshift(extra);
        }
      }
    }
    return opts;
  }, [items, extraOptions]);

  const handlePopupScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      if (
        target.scrollTop + target.offsetHeight >= target.scrollHeight - 20 &&
        topicsQuery.hasNextPage &&
        !topicsQuery.isFetchingNextPage
      ) {
        void topicsQuery.fetchNextPage();
      }
    },
    [topicsQuery.hasNextPage, topicsQuery.isFetchingNextPage, topicsQuery.fetchNextPage],
  );

  return (
    <Select
      showSearch
      placeholder={placeholder}
      optionFilterProp="label"
      allowClear={allowClear}
      mode={mode}
      disabled={disabled}
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      options={options}
      notFoundContent={
        topicsQuery.isLoading ? "Đang tải..." : "Không có dữ liệu"
      }
      className={className}
      onPopupScroll={handlePopupScroll}
      popupRender={(menu) => (
        <>
          {menu}
          {topicsQuery.isFetchingNextPage && (
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
      )}
    />
  );
}
