"use client";

import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { postsApi, type ApiPost } from "@/lib/api";
import { qk } from "@/lib/query-keys";

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
}

function mapPost(post: ApiPost): SearchResult {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    cover: post.cover ?? "",
  };
}

export function useSearchPosts(query: string, limit = 8) {
  const [debouncedQuery] = useDebouncedValue(query, 500);

  const enabled = debouncedQuery.trim().length >= 2;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...qk.searchPosts(debouncedQuery), limit] as const,
    queryFn: async () => {
      const res = await postsApi.list({
        q: debouncedQuery,
        status: "published",
        limit,
        page: 1,
      });
      return res.data.map(mapPost);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    results: data ?? [],
    isLoading: enabled && isLoading,
    isFetching: enabled && isFetching,
    debouncedQuery,
    enabled,
  };
}
