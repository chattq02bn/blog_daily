"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ensureCookieSynced, getLikedMap, subscribePostLikes } from "@/lib/post-likes";

const LikedIdsContext = createContext<ReadonlySet<string>>(new Set());

/**
 * Cung cấp tập hợp bài viết user đã like cho toàn bộ cây component.
 * - SSR/lần render đầu: lấy từ cookie (server đọc qua getInitialLikedIds)
 * - Sau khi mount: đồng bộ theo localStorage (nguồn đầy đủ hơn cookie)
 */
export default function LikesProvider({
  initialLikedIds,
  children,
}: {
  initialLikedIds?: string[];
  children: ReactNode;
}) {
  const [likedIds, setLikedIds] = useState<ReadonlySet<string>>(() =>
    new Set(initialLikedIds ?? [])
  );

  useEffect(() => {
    ensureCookieSynced();
    const sync = () => {
      const map = getLikedMap();
      setLikedIds(new Set(Object.keys(map).filter((id) => map[id])));
    };
    sync();
    return subscribePostLikes(sync);
  }, []);

  const value = useMemo(() => likedIds, [likedIds]);

  return <LikedIdsContext.Provider value={value}>{children}</LikedIdsContext.Provider>;
}

export function useIsPostLiked(postId: string): boolean {
  return useContext(LikedIdsContext).has(postId);
}
