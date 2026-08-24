"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { Block } from "@blocknote/core";

export default function PreviewEditor({
  blocks,
}: {
  blocks: Record<string, unknown>[];
}) {
  const editor = useCreateBlockNote({
    initialContent: blocks.length
      ? (blocks as unknown as Block[])
      : undefined,
  });

  return <BlockNoteView editor={editor} editable={false} theme="light" />;
}
