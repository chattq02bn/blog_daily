"use client";

import { useState, type ReactNode } from "react";
import { Popover } from "antd";
import {
  BgColorsOutlined,
  BoldOutlined,
  CodeOutlined,
  FontColorsOutlined,
  ItalicOutlined,
  LinkOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
} from "@ant-design/icons";
import type { BlockNoteEditor } from "@blocknote/core";
import { productCardSchema } from "./productCard";
import styles from "./Editor.module.scss";

type EditorType = BlockNoteEditor<
  typeof productCardSchema.blockSchema,
  typeof productCardSchema.inlineContentSchema,
  typeof productCardSchema.styleSchema
>;

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

export default function MobileEditorToolbar({
  editor,
  slashMenuItems,
}: {
  editor: EditorType;
  slashMenuItems?: ReactNode[];
}) {
  return (
    <div className={styles.mobileToolbar}>
      <div className={styles.mobileToolbarScroll}>
        <FormatControls editor={editor} />
        {slashMenuItems && slashMenuItems.length > 0 && (
          <>
            <span className={styles.mobileToolbarDivider} />
            {slashMenuItems}
          </>
        )}
      </div>
    </div>
  );
}

function FormatControls({ editor }: { editor: EditorType }) {
  const [, setTick] = useState(0);
  const [sticky, setSticky] = useState<StickyFmt>({});
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  const isFmtActive = (key: FmtKey) => {
    if (sticky[key] !== undefined) return sticky[key];
    return Boolean(
      (editor.getActiveStyles() as Record<string, unknown>)[key],
    );
  };

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

  const effColor = (prop: "textColor" | "backgroundColor"): NoteColorName => {
    const s = sticky[prop];
    if (s) return s;
    const current = (
      editor.getActiveStyles() as Record<string, string | undefined>
    )[prop];
    if (current && NOTE_COLORS.some((c) => c.name === current))
      return current as NoteColorName;
    return "default";
  };

  const activeColorHex = (prop: "textColor" | "backgroundColor") =>
    NOTE_COLORS.find((c) => c.name === effColor(prop))?.hex;

  const setColor = (prop: "textColor" | "backgroundColor", name: NoteColorName) => {
    editor.focus();
    if (name === "default") {
      editor.removeStyles({ [prop]: true } as Parameters<typeof editor.removeStyles>[0]);
    } else {
      editor.addStyles({ [prop]: name } as Parameters<typeof editor.addStyles>[0]);
    }
    setSticky((s) => ({ ...s, [prop]: name }));
    setTick((t) => t + 1);
  };

  const curLink = (() => {
    try {
      return editor.getSelectedLinkUrl() ?? "";
    } catch {
      return "";
    }
  })();

  const applyLink = () => {
    if (!linkUrl) return;
    const existing = editor.getSelectedLinkUrl();
    const text = editor.getSelectedText();
    editor.focus();
    if (existing && text) editor.editLink(linkUrl, text);
    else editor.createLink(linkUrl);
    setLinkUrl("");
    setTick((t) => t + 1);
  };

  const removeLink = () => {
    editor.focus();
    editor.deleteLink();
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
                    effColor("backgroundColor") === c.name ? styles.swatchOn : ""
                  }`}
                  style={{ background: c.hex }}
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
          open={linkOpen}
          onOpenChange={(v) => {
            if (v) setLinkUrl(curLink);
            setLinkOpen(v);
          }}
          title="Gán link"
          content={
            <div className={styles.linkPop}>
              <input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyLink()}
                autoFocus
              />
              <div className={styles.popActions}>
                {curLink && (
                  <button
                    type="button"
                    className={`${styles.popBtn} ${styles.popDanger}`}
                    onClick={removeLink}
                  >
                    Bỏ link
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.popBtn} ${styles.popPrimary}`}
                  onClick={applyLink}
                >
                  Áp dụng
                </button>
              </div>
            </div>
          }
        >
          <button
            type="button"
            title="Gán link"
            aria-label="Gán link"
            className={`${styles.fmtBtn} ${curLink ? styles.fmtBtnOn : ""}`}
            onMouseDown={(e) => e.preventDefault()}
          >
            <LinkOutlined />
          </button>
        </Popover>
      </div>
    </>
  );
}
