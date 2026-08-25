"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { productCardSchema } from "./productCard";
import { useTheme } from "@/components/theme/ThemeProvider";
import EditorLoading from "./EditorLoading";
import styles from "./EditorLoading.module.scss";
import { useEditorReady } from "./useEditorReady";

export default function PreviewEditor({
  blocks,
}: {
  blocks: Record<string, unknown>[];
}) {
  const { theme } = useTheme();
  const { ref, ready } = useEditorReady<HTMLDivElement>();
  const editor = useCreateBlockNote({
    schema: productCardSchema,
    initialContent: blocks.length
      ? (blocks as unknown as (typeof productCardSchema.PartialBlock)[])
      : undefined,
  });

  return (
    <div ref={ref} className={styles.gate} data-ready={ready}>
      {!ready && <EditorLoading />}
      <BlockNoteView editor={editor} editable={false} theme={theme} />
    </div>
  );
}
