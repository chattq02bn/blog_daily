"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ensureCookieSynced, getLikedMap, subscribeCommentLikes } from "@/lib/comment-likes";

const LikedCommentIdsContext = createContext<ReadonlySet<string>>(new Set());

export default function CommentLikesProvider({
  initialLikedCommentIds,
  children,
}: {
  initialLikedCommentIds?: string[];
  children: ReactNode;
}) {
  const [likedIds, setLikedIds] = useState<ReadonlySet<string>>(() =>
    new Set(initialLikedCommentIds ?? [])
  );

  useEffect(() => {
    ensureCookieSynced();
    const sync = () => {
      const map = getLikedMap();
      setLikedIds(new Set(Object.keys(map).filter((id) => map[id])));
    };
    sync();
    return subscribeCommentLikes(sync);
  }, []);

  const value = useMemo(() => likedIds, [likedIds]);

  return <LikedCommentIdsContext.Provider value={value}>{children}</LikedCommentIdsContext.Provider>;
}

export function useIsCommentLiked(commentId: string): boolean {
  return useContext(LikedCommentIdsContext).has(commentId);
}
