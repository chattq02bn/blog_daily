"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CloseOutlined, SendOutlined, SmileOutlined, EditOutlined } from "@ant-design/icons";
import { Popover, message } from "antd";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { createComment, getCurrentUser, updateUser } from "@/lib/commentStorage";
import styles from "./CommentForm.module.scss";

interface CommentFormProps {
  noteId: string;
  parentId?: string | null;
  parentAuthor?: string;
  onSubmit: () => void;
  onCancel?: () => void;
  compact?: boolean;
  onProfileChange?: () => void;
}

export default function CommentForm({
  noteId,
  parentId = null,
  parentAuthor,
  onSubmit,
  onCancel,
  compact = false,
  onProfileChange,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (parentId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [parentId, parentAuthor]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setIsDesktop(mq.matches);
      if (!mq.matches) setShowEmoji(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      createComment(noteId, currentUser.name, currentUser.avatar, trimmed, parentId);
      setContent("");
      setIsFocused(false);
      setShowEmoji(false);
      onSubmit();
      if (onCancel) onCancel();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
    textareaRef.current?.focus();
  };

  const startEditName = () => {
    setNameDraft(currentUser.name);
    setEditingName(true);
  };

  const saveName = () => {
    setEditingName(false);
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === currentUser.name) return;
    if (updateUser(trimmed)) {
      message.success("Đã cập nhật tên hiển thị");
      onProfileChange?.();
    }
  };

  const handleCancel = () => {
    setContent("");
    setIsFocused(false);
    if (onCancel) onCancel();
  };

  const showForm = isFocused || content || parentId;

  const isSelfReply =
    !!parentId && !!parentAuthor && parentAuthor === currentUser.name;

  return (
    <div className={`${styles.form} ${compact ? styles.compact : ""}`}>
      {parentId && parentAuthor && !isSelfReply && (
        <div className={styles.replyIndicator}>
          <span>
            Đang trả lời <strong>{parentAuthor}</strong>
          </span>
          <button type="button" className={styles.cancelReply} onClick={handleCancel}>
            <CloseOutlined />
          </button>
        </div>
      )}
      {!parentId && (
        <div className={styles.nameRow}>
          <span className={styles.nameLabel}>Bình luận với tên:</span>
          {editingName ? (
            <input
              className={styles.nameInput}
              value={nameDraft}
              maxLength={40}
              autoFocus
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") setEditingName(false);
              }}
              onBlur={saveName}
            />
          ) : (
            <button
              type="button"
              className={styles.nameButton}
              onClick={startEditName}
              title="Bấm để đổi tên"
            >
              {currentUser.name} <EditOutlined />
            </button>
          )}
        </div>
      )}
      <div className={styles.inputRow}>
        <Image
          src={currentUser.avatar}
          alt={currentUser.name}
          width={32}
          height={32}
          className={styles.avatar}
          unoptimized
        />
        <div className={styles.inputContainer}>
          {showForm ? (
            <form onSubmit={handleSubmit}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                placeholder={parentId ? `Trả lời @${parentAuthor}...` : "Viết bình luận..."}
                rows={compact ? 2 : 3}
                disabled={isSubmitting}
                autoFocus
              />
              <div className={styles.actions}>
                {isDesktop && (
                  <Popover
                    trigger="click"
                    placement="bottomRight"
                    arrow={false}
                    open={showEmoji}
                    onOpenChange={setShowEmoji}
                    content={
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        autoFocusSearch={false}
                        previewConfig={{ showPreview: false }}
                        lazyLoadEmojis
                        height={300}
                        width={300}
                      />
                    }
                  >
                    <button
                      type="button"
                      className={styles.emojiButton}
                      aria-label="Chọn emoji"
                    >
                      <SmileOutlined />
                    </button>
                  </Popover>
                )}
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancel}
                  aria-label="Đóng"
                >
                  <CloseOutlined />
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!content.trim() || isSubmitting}
                >
                  <SendOutlined />
                </button>
              </div>
            </form>
          ) : (
            <div
              className={styles.placeholder}
              onClick={() => setIsFocused(true)}
            >
              Viết bình luận...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
