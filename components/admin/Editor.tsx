"use client";

import { useEffect } from "react";
import "@blocknote/core/style.css";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import type { Block } from "@blocknote/core";

export default function Editor({
  value,
  onChange,
}: {
  value?: Block[];
  onChange?: (blocks: Block[]) => void;
}) {
  const editor = useCreateBlockNote({
    initialContent: value && value.length ? value : undefined,
    placeholders: { default: "Viết nội dung bài viết..." },
  });

  useEffect(() => {
    if (!onChange) return;
    return editor.onChange((e) => {
      onChange(e.document); // bỏ blocksToHTMLLossy ở đây
    });
  }, [editor, onChange]);

  return <BlockNoteView editor={editor} theme="light" />;
}
