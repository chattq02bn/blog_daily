"use client";

import LikeButton from "@/components/likes/LikeButton";

export default function NoteLike({ postId, likes }: { postId: string; likes: number }) {
  return <LikeButton postId={postId} likes={likes} />;
}
