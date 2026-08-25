"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { Drawer, Input, Popover } from "antd";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  BgColorsOutlined,
  BoldOutlined,
  CodeOutlined,
  DeleteOutlined,
  FontColorsOutlined,
  ItalicOutlined,
  LinkOutlined,
  PlusOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
} from "@ant-design/icons";
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

/* Bảng màu khớp với màu mặc định của BlockNote */
const NOTE_COLORS = [
  { name: "default", hex: "#3f3f3f" },
  { name: "gray", hex: "#9b9a97" },
  { name: "brown", hex: "#64473a" },
  { name: "red", hex: "#e03e3e" },
  { name: "orange", hex: "#d9730d" },
  { name: "yellow", hex: "#dfab01" },
  { name: "green", hex: "#4d6461" },
  { name: "blue", hex: "#0b6e99" },
  { name: "purple", hex: "#6940a5" },
  { name: "pink", hex: "#ad1a72" },
] as const;

type NoteColorName = (typeof NOTE_COLORS)[number]["name"];

type FmtKey = "bold" | "italic" | "underline" | "strike" | "code";

const FMT_ITEMS: { key: FmtKey; label: string; icon: ReactNode }[] = [
  { key: "bold", label: "Đậm", icon: <BoldOutlined /> },
  { key: "italic", label: "Nghiêng", icon: <ItalicOutlined /> },
  { key: "underline", label: "Gạch chân", icon: <UnderlineOutlined /> },
  { key: "strike", label: "Gạch ngang", icon: <StrikethroughOutlined /> },
  { key: "code", label: "Code", icon: <CodeOutlined /> },
];

type StickyFmt = Partial<
  Record<FmtKey, boolean> &
    Record<"textColor" | "backgroundColor", NoteColorName>
>;

/* Nhóm nút định dạng/màu/link trong sheet của nút "+".
   Tách component riêng để khi gõ chữ (selection đổi liên tục) chỉ re-render
   vùng nhỏ này, không đụng vào cây BlockNoteView -> hết giật lag */
function MobileFormatControls({ editor }: { editor: EditorType }) {
  const [, setTick] = useState(0);
  const [sticky, setSticky] = useState<StickyFmt>({});
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  /* Resync sticky theo editor khi con trỏ/vùng chọn đổi */
  useEffect(
    () =>
      editor.onSelectionChange(() => {
        setSticky({});
        setTick((t) => t + 1);
      }),
    [editor],
  );

  /* Sticky là nguồn sự thật cho UI: false (đã tắt rõ ràng) phải thắng
     editor state, nếu không nút sẽ sáng lại ngay sau khi inactive */
  const isFmtActive = (key: FmtKey) => {
    if (sticky[key] !== undefined) return sticky[key];
    return Boolean(
      (editor.getActiveStyles() as Record<string, unknown>)[key],
    );
  };

  /* Bật/tắt theo đúng hướng UI đang hiển thị. Khi tắt phải xoá cả STORED
     MARKS (định dạng chờ gõ) ở con trỏ trống, nếu không chữ gõ tiếp vẫn
     còn format cũ */
  const setFmtMark = (key: FmtKey, on: boolean) => {
    const mark = { [key]: true } as Parameters<typeof editor.addStyles>[0];
    if (on) {
      editor.addStyles(mark);
      return;
    }
    editor.removeStyles(mark);
    try {
      editor.transact((tr) => {
        const base = tr.storedMarks ?? tr.selection.$from.marks();
        tr.setStoredMarks(base.filter((m) => m.type.name !== key));
      });
    } catch {
      /* PM không hỗ trợ stored marks thì bỏ qua */
    }
  };

  const toggleFmt = (key: FmtKey) => {
    const on = !isFmtActive(key);
    editor.focus();
    setFmtMark(key, on);
    setSticky((s) => ({ ...s, [key]: on }));
    setTick((t) => t + 1);
  };

  /* Màu đang hiệu lực: ưu tiên sticky rồi mới tới editor */
  const effColor = (prop: "textColor" | "backgroundColor"): NoteColorName => {
    const s = sticky[prop];
    if (s) return s;
    const current = (
      editor.getActiveStyles() as Record<string, string | undefined>
    )[prop];
    return (current ?? "default") as NoteColorName;
  };

  /* Tô màu active lên chính ô button (default: chữ đen, nền trắng) */
  const activeColorHex = (prop: "textColor" | "backgroundColor") => {
    const name = effColor(prop);
    if (name === "default")
      return prop === "backgroundColor" ? "#ffffff" : "#3f3f3f";
    return NOTE_COLORS.find((c) => c.name === name)?.hex ?? "#3f3f3f";
  };

  const setColor = (
    prop: "textColor" | "backgroundColor",
    name: NoteColorName,
  ) => {
    editor.focus();
    if (name === "default") {
      if (prop === "textColor") editor.removeStyles({ textColor: "default" });
      else editor.removeStyles({ backgroundColor: "default" });
    } else {
      if (prop === "textColor") editor.addStyles({ textColor: name });
      else editor.addStyles({ backgroundColor: name });
    }
    setSticky((s) => ({ ...s, [prop]: name }));
    setTick((t) => t + 1);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    const existing = editor.getSelectedLinkUrl();
    const text = editor.getSelectedText();
    editor.focus();
    if (existing && text) editor.editLink(url, text);
    else editor.createLink(url);
    setLinkOpen(false);
    setTick((t) => t + 1);
  };

  const removeLink = () => {
    editor.focus();
    editor.deleteLink();
    setLinkOpen(false);
    setTick((t) => t + 1);
  };

  return (
    <>
      <div className={styles.fmtRow}>
        {FMT_ITEMS.map((f) => (
          <button
            key={f.key}
            type="button"
            title={f.label}
            aria-label={f.label}
            className={`${styles.fmtBtn} ${
              isFmtActive(f.key) ? styles.fmtBtnOn : ""
            }`}
            /* Giữ selection trong editor không bị mất khi bấm */
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFmt(f.key)}
          >
            {f.icon}
          </button>
        ))}
      </div>

      <div className={styles.fmtRow}>
        <Popover
          trigger="click"
          placement="top"
          title="Màu chữ"
          content={
            <div className={styles.swatchGrid}>
              {NOTE_COLORS.map((c) => (
                <button
                  key={`t-${c.name}`}
                  type="button"
                  aria-label={c.name}
                  className={`${styles.swatch} ${
                    effColor("textColor") === c.name ? styles.swatchOn : ""
                  }`}
                  style={{ background: c.hex }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setColor("textColor", c.name)}
                />
              ))}
            </div>
          }
        >
          <button
            type="button"
            title="Màu chữ"
            aria-label="Màu chữ"
            className={styles.fmtBtn}
            style={{ color: activeColorHex("textColor") }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <FontColorsOutlined />
          </button>
        </Popover>

        <Popover
          trigger="click"
          placement="top"
          title="Màu nền"
          content={
            <div className={styles.swatchGrid}>
              {NOTE_COLORS.map((c) => (
                <button
                  key={`b-${c.name}`}
                  type="button"
                  aria-label={c.name}
                  className={`${styles.swatch} ${
                    effColor("backgroundColor") === c.name
                      ? styles.swatchOn
                      : ""
                  }`}
                  style={{
                    background: c.name === "default" ? "#ffffff" : c.hex,
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setColor("backgroundColor", c.name)}
                />
              ))}
            </div>
          }
        >
          <button
            type="button"
            title="Màu nền"
            aria-label="Màu nền"
            className={styles.fmtBtn}
            style={{ background: activeColorHex("backgroundColor") }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <BgColorsOutlined />
          </button>
        </Popover>

        <Popover
          trigger="click"
          placement="top"
          title="Gán link"
          open={linkOpen}
          onOpenChange={(open) => {
            setLinkOpen(open);
            if (open) setLinkUrl(editor.getSelectedLinkUrl() ?? "");
          }}
          content={
            <div className={styles.linkPop}>
              <Input
                size="small"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onPressEnter={applyLink}
              />
              <div className={styles.popActions}>
                {editor.getSelectedLinkUrl() && (
                  <button
                    type="button"
                    className={`${styles.popBtn} ${styles.popDanger}`}
                    onClick={removeLink}
                  >
                    Xoá link
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.popBtn} ${styles.popPrimary}`}
                  onClick={applyLink}
                >
                  Gán
                </button>
              </div>
            </div>
          }
        >
          <button
            type="button"
            title="Gán link"
            aria-label="Gán link"
            className={`${styles.fmtBtn} ${
              editor.getSelectedLinkUrl() ? styles.fmtBtnOn : ""
            }`}
            onMouseDown={(e) => e.preventDefault()}
          >
            <LinkOutlined />
          </button>
        </Popover>
      </div>
    </>
  );
}

export default function Editor({
  value,
  onChange,
}: {
  value?: Block[];
  onChange?: (blocks: Block[]) => void;
}) {
  const { theme } = useTheme();
  const editor = useCreateBlockNote({
    schema: productCardSchema,
    initialContent:
      value && value.length
        ? (value as unknown as (typeof productCardSchema.PartialBlock)[])
        : undefined,
    placeholders: { default: "Viết nội dung bài viết..." },
  });

  const [isPhone, setIsPhone] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteTop, setDeleteTop] = useState<number | null>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);

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

  /* Mobile: đẩy nút "+" lên trên bàn phím khi bàn phím mở */
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!isPhone) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const overlap = Math.max(
        0,
        document.documentElement.clientHeight - vv.height - vv.offsetTop
      );
      setKeyboardOffset(overlap);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [isPhone]);

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
        <BlockNoteView
          editor={editor}
          theme={theme}
          slashMenu={false}
          /* Desktop: side menu mặc định (+, kéo thả). Mobile: đã có nút xoá riêng.
             Mobile: tắt formatting toolbar nổi, định dạng nằm trong nút "+" */
          sideMenu={!isPhone}
          formattingToolbar={!isPhone}
        >
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) =>
              filterSuggestionItems(getCustomSlashMenuItems(), query)
            }
          />
        </BlockNoteView>
      </div>

      {/* Mobile: nút "+" cố định đáy màn hình, mở sheet định dạng + chèn khối */}
      {isPhone && (
        <>
          <button
            type="button"
            className={styles.fab}
            style={{ bottom: 65 + keyboardOffset }}
            aria-label="Chèn khối nội dung"
            onClick={() => setSheetOpen(true)}
          >
            <PlusOutlined />
          </button>
          <Drawer
            title="Công cụ nội dung"
            placement="bottom"
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            size="auto"
            styles={{ body: { paddingTop: 4 } }}
          >
            <div className={styles.sheetLabel}>Định dạng văn bản</div>
            <MobileFormatControls editor={editor} />

            <div className={styles.sheetLabel}>Chèn nội dung</div>
            <div className={styles.sheetGrid}>
              {getCustomSlashMenuItems().map((item) => (
                <button
                  key={item.title}
                  type="button"
                  className={styles.sheetItem}
                  onClick={() => {
                    item.onItemClick();
                    setSheetOpen(false);
                  }}
                >
                  <span className={styles.sheetIcon}>{item.icon}</span>
                  <span className={styles.sheetText}>
                    <span className={styles.sheetTitle}>{item.title}</span>
                    {item.subtext && (
                      <small className={styles.sheetSubtext}>{item.subtext}</small>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </Drawer>
        </>
      )}
    </>
  );
}
