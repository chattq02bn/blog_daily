"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import { createComment, getCurrentUser } from "@/lib/commentStorage";
import styles from "./CommentForm.module.scss";

interface CommentFormProps {
  noteId: string;
  parentId?: string | null;
  parentAuthor?: string;
  onSubmit: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export default function CommentForm({
  noteId,
  parentId = null,
  parentAuthor,
  onSubmit,
  onCancel,
  compact = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (parentId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [parentId, parentAuthor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      createComment(noteId, currentUser.name, currentUser.avatar, trimmed, parentId);
      setContent("");
      setIsFocused(false);
      onSubmit();
      if (onCancel) onCancel();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const handleCancel = () => {
    setContent("");
    setIsFocused(false);
    if (onCancel) onCancel();
  };

  const showForm = isFocused || content || parentId;

  return (
    <div className={`${styles.form} ${compact ? styles.compact : ""}`}>
      {parentId && parentAuthor && (
        <div className={styles.replyIndicator}>
          <span>Đang trả lời <strong>{parentAuthor}</strong></span>
          <button type="button" className={styles.cancelReply} onClick={handleCancel}>
            <CloseOutlined />
          </button>
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
              />
              <div className={styles.actions}>
                {!parentId && (
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancel}
                  >
                    <CloseOutlined />
                  </button>
                )}
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
