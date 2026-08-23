"use client";

import dynamic from "next/dynamic";
import type { Note } from "@/data/notes";

const CommentList = dynamic(() => import("@/components/CommentList"), {
  ssr: false,
});

const TopicCard = dynamic(() => import("@/components/TopicCard"), {
  ssr: false,
});

export function ClientCommentList({ noteId }: { noteId: string }) {
  return <CommentList noteId={noteId} />;
}

export function ClientTopicCard({
  note,
  featured,
}: {
  note: Note;
  featured?: boolean;
}) {
  return <TopicCard note={note} featured={featured} />;
}
