"use client";

import { useEffect, useRef, useState } from "react";
import "@blocknote/core/style.css";
import "@blocknote/core/fonts/inter.css";
import {
  filterSuggestionItems,
  insertOrUpdateBlockForSlashMenu,
} from "@blocknote/core/extensions";
import {
  type DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useTheme } from "@/components/theme/ThemeProvider";
import EditorLoading from "./EditorLoading";
import loadingStyles from "./EditorLoading.module.scss";
import { useEditorReady } from "./useEditorReady";
import { DeleteOutlined } from "@ant-design/icons";
import type { Block, BlockNoteEditor } from "@blocknote/core";
import { productCardSchema } from "./productCard";
import styles from "./Editor.module.scss";

type EditorType = BlockNoteEditor<
  typeof productCardSchema.blockSchema,
  typeof productCardSchema.inlineContentSchema,
  typeof productCardSchema.styleSchema
>;

/* =========================================================
   PRODUCT CARD MENU ITEM
========================================================= */

export const productCardMenuItem = (
  editor: EditorType
): DefaultReactSuggestionItem => ({
  title: "Card sản phẩm",

  subtext: "Thêm Card giới thiệu sản phẩm",

  aliases: ["card", "product", "product card", "sanpham", "sản phẩm", "shop"],

  group: "Advanced",

  icon: (
    <div
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f0f0",
        fontSize: "18px",
      }}
    >
      🛍️
    </div>
  ),

  onItemClick: () => {
    insertOrUpdateBlockForSlashMenu(editor, {
      type: "productCard",

      props: {
        title: "Tên sản phẩm",

        description:
          "Mô tả ngắn gọn về sản phẩm — chỉ hiển thị tối đa 3 dòng.",

        imageUrl:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30",

        buttonText: "Mua ngay",

        buttonUrl: "#",
      },
    });
  },
});

export default function Editor({
  value,
  onChange,
  onEditorReady,
}: {
  value?: Block[];
  onChange?: (blocks: Block[]) => void;
  onEditorReady?: (editor: EditorType) => void;
}) {
  const { theme } = useTheme();
  const { ref: readyRef, ready } = useEditorReady<HTMLDivElement>();
  const editor = useCreateBlockNote({
    schema: productCardSchema,
    initialContent:
      value && value.length
        ? (value as unknown as (typeof productCardSchema.PartialBlock)[])
        : undefined,
    placeholders: { default: "Viết nội dung bài viết..." },
  });

  /* Báo cho parent biết editor đã sẵn sàng */
  const onEditorReadyRef = useRef(onEditorReady);
  onEditorReadyRef.current = onEditorReady;
  useEffect(() => {
    if (ready && onEditorReadyRef.current) onEditorReadyRef.current(editor);
  }, [ready, editor]);

  const [isPhone, setIsPhone] = useState(false);
  const [deleteTop, setDeleteTop] = useState<number | null>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);

  /* Khi value thay đổi từ bên ngoài (ví dụ: load xong bài viết),
     cập nhật nội dung editor nếu khác với hiện tại */
  const lastExternalValue = useRef<string>("");
  useEffect(() => {
    if (!value || !ready) return;
    const incoming = JSON.stringify(value);
    if (incoming === lastExternalValue.current) return;
    lastExternalValue.current = incoming;
    const current = JSON.stringify(editor.document);
    if (incoming === current) return;
    editor.replaceBlocks(editor.document, value as unknown as (typeof productCardSchema.PartialBlock)[]);
  }, [value, ready, editor]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* Mobile: nút xoá đỏ luôn hiển thị cạnh block đang đặt con trỏ */
  useEffect(() => {
    if (!isPhone) return;
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        try {
          const { block } = editor.getTextCursorPosition();
          const el = editor.domElement?.querySelector(
            `[data-id="${block.id}"]`
          );
          const wrap = editorWrapRef.current;
          if (!el || !wrap) return;
          const b = el.getBoundingClientRect();
          const w = wrap.getBoundingClientRect();
          const next = b.top - w.top + 2;
          /* Giữ nguyên giá trị cũ nếu không đổi để tránh re-render mỗi phím */
          setDeleteTop((prev) => (prev === next ? prev : next));
        } catch {
          /* editor chưa sẵn sàng */
        }
      });
    };
    sync();
    const offChange = editor.onChange(sync);
    const offSelection = editor.onSelectionChange(sync);
    window.addEventListener("scroll", sync, true);
    window.addEventListener("resize", sync);
    return () => {
      offChange();
      offSelection();
      window.removeEventListener("scroll", sync, true);
      window.removeEventListener("resize", sync);
      cancelAnimationFrame(raf);
    };
  }, [isPhone, editor]);

  const handleDeleteCurrentBlock = () => {
    const { block } = editor.getTextCursorPosition();
    if (editor.document.length <= 1) {
      // Chỉ còn 1 block: xoá sạch nội dung, thay bằng đoạn trống
      editor.updateBlock(block, { type: "paragraph", content: [] });
    } else {
      editor.removeBlocks([block]);
    }
    editor.focus();
  };

  useEffect(() => {
    if (!onChange) return;
    return editor.onChange((e) => {
      onChange(e.document as unknown as Block[]);
    });
  }, [editor, onChange]);

  return (
    <>
      <div ref={editorWrapRef} className={styles.editorWrap}>
        {/* Mobile: nút xoá đỏ luôn hiển thị cạnh block đang đặt con trỏ */}
        {isPhone && deleteTop !== null && (
          <button
            type="button"
            className={styles.blockDelete}
            style={{ top: deleteTop }}
            aria-label="Xóa khối"
            title="Xóa khối"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleDeleteCurrentBlock}
          >
            <DeleteOutlined />
          </button>
        )}
        <div ref={readyRef} className={loadingStyles.gate} data-ready={ready}>
          {!ready && <EditorLoading />}
          <BlockNoteView
            editor={editor}
            theme={theme}
            slashMenu={false}
            sideMenu={!isPhone}
            formattingToolbar={!isPhone}
          >
            <SuggestionMenuController
              triggerCharacter="/"
              getItems={async (query) => {
                const items = getDefaultReactSlashMenuItems(editor);
                const productCard = productCardMenuItem(editor);
                const tableIndex = items.findIndex((i) => i.title === "Table");
                if (tableIndex !== -1) items.splice(tableIndex + 1, 0, productCard);
                else items.push(productCard);
                return filterSuggestionItems(items, query);
              }}
            />
          </BlockNoteView>
        </div>
      </div>
    </>
  );
}
