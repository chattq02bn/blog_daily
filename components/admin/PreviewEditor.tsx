"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { productCardSchema } from "./productCard";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function PreviewEditor({
  blocks,
}: {
  blocks: Record<string, unknown>[];
}) {
  const { theme } = useTheme();
  const editor = useCreateBlockNote({
    schema: productCardSchema,
    initialContent: blocks.length
      ? (blocks as unknown as (typeof productCardSchema.PartialBlock)[])
      : undefined,
  });

  return <BlockNoteView editor={editor} editable={false} theme={theme} />;
}
