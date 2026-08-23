"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { Block } from "@blocknote/core";

export default function PreviewEditor({ blocks }: { blocks: Block[] }) {
  const editor = useCreateBlockNote({
    initialContent: blocks.length ? blocks : undefined,
  });

  return <BlockNoteView editor={editor} editable={false} theme="light" />;
}
