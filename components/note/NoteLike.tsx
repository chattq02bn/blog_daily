"use client";

import LikeButton from "@/components/likes/LikeButton";

export default function NoteLike({ postId }: { postId: string; likes: number }) {
  return <LikeButton postId={postId} />;
}
