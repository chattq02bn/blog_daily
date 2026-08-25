"use client";

import dynamic from "next/dynamic";
import type { Note } from "@/data/notes";
import EditorLoading from "@/components/admin/EditorLoading";

const CommentList = dynamic(() => import("@/components/comment/CommentList"), {
  ssr: false,
});

const TopicCard = dynamic(() => import("@/components/topic/TopicCard"), {
  ssr: false,
});

const PreviewEditor = dynamic(
  () => import("@/components/admin/PreviewEditor"),
  { ssr: false, loading: () => <EditorLoading /> }
);

export function ClientNoteBody({
  blocks,
}: {
  blocks: Record<string, unknown>[];
}) {
  return <PreviewEditor blocks={blocks} />;
}

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
