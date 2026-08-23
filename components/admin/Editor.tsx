"use client";

import { useEffect } from "react";
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
import type { Block, BlockNoteEditor } from "@blocknote/core";
import { productCardSchema } from "./productCard";

type EditorType = BlockNoteEditor<
  typeof productCardSchema.blockSchema,
  typeof productCardSchema.inlineContentSchema,
  typeof productCardSchema.styleSchema
>;

/* =========================================================
   PRODUCT CARD MENU ITEM
========================================================= */

const productCardMenuItem = (
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
        badge: "SẢN PHẨM MỚI",

        title: "Tên sản phẩm",

        description:
          "Mô tả chi tiết về sản phẩm. Đây là nơi bạn có thể giới thiệu những đặc điểm nổi bật, công dụng và ưu điểm của sản phẩm.",

        price: "1.990.000đ",

        oldPrice: "2.490.000đ",

        discount: "-20%",

        imageUrl:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30",

        buttonText: "Mua ngay",

        buttonUrl: "#",

        feature1: "✓ Chính hãng 100%",

        feature2: "✓ Bảo hành 12 tháng",

        feature3: "✓ Miễn phí vận chuyển",
      },
    });
  },
});

export default function Editor({
  value,
  onChange,
}: {
  value?: Block[];
  onChange?: (blocks: Block[]) => void;
}) {
  const editor = useCreateBlockNote({
    schema: productCardSchema,
    initialContent:
      value && value.length
        ? (value as unknown as (typeof productCardSchema.PartialBlock)[])
        : undefined,
    placeholders: { default: "Viết nội dung bài viết..." },
  });

  useEffect(() => {
    if (!onChange) return;
    return editor.onChange((e) => {
      onChange(e.document as unknown as Block[]); // bỏ blocksToHTMLLossy ở đây
    });
  }, [editor, onChange]);

  /* =========================================================
     CUSTOM SLASH MENU
  ========================================================= */

  const getCustomSlashMenuItems = (): DefaultReactSuggestionItem[] => {
    const items = [...getDefaultReactSlashMenuItems(editor)];

    const productCard = productCardMenuItem(editor);

    /*
     * Đặt Product Card ngay sau Table.
     */

    const tableIndex = items.findIndex((item) => item.title === "Table");

    if (tableIndex !== -1) {
      items.splice(tableIndex + 1, 0, productCard);
    } else {
      items.push(productCard);
    }

    return items;
  };

  return (
    <BlockNoteView editor={editor} theme="light" slashMenu={false}>
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) =>
          filterSuggestionItems(getCustomSlashMenuItems(), query)
        }
      />
    </BlockNoteView>
  );
}
