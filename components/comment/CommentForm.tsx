"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CloseOutlined, SendOutlined, SmileOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
import { Popover, App } from "antd";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import {
  getCommenterNickname,
  setCommenterToken,
  setCommenterId,
  setCommenterNickname,
  hasCommenter,
} from "@/lib/commenter";
import { hasAuth, getStoredUser } from "@/lib/auth";
import { useProfile } from "@/hooks/use-api";
import { useCreateComment } from "@/hooks/use-api";
import { apiCommentToComment } from "@/lib/api/adapters";
import { commentsApi } from "@/lib/api";
import styles from "./CommentForm.module.scss";

type Flat = ReturnType<typeof apiCommentToComment>;

interface CommentFormProps {
  noteId: string;
  parentId?: string | null;
  rootCommentId?: string;
  parentAuthor?: string;
  parentCommenterId?: number;
  authorId?: number;
  onSubmit: (optimisticReply: Flat) => void;
  onCancel?: () => void;
  compact?: boolean;
  submitting?: boolean;
}

export default function CommentForm({
  noteId,
  parentId = null,
  rootCommentId,
  parentAuthor,
  parentCommenterId,
  authorId,
  onSubmit,
  onCancel,
  compact = false,
  submitting = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createComment = useCreateComment(noteId);
  const { message } = App.useApp();

  const isLoggedIn = hasAuth();
  const storedUser = getStoredUser();
  const { data: profile } = useProfile();
  const userAvatar = profile?.avatar || "";
  const isPostAuthor = isLoggedIn && storedUser?.id != null && authorId != null && Number(storedUser.id) === authorId;

  const commenterName = isLoggedIn
    ? (storedUser?.name || "Người dùng")
    : (getCommenterNickname() || "Người dùng");

  const commenterId = typeof window !== "undefined"
    ? Number(localStorage.getItem("note_commenter_id") || "0")
    : 0;

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

  useEffect(() => {
    if (isLoggedIn || hasCommenter()) return;
    commentsApi.generateName(noteId).then((name) => {
      setCommenterNickname(name);
    }).catch(() => {});
  }, [isLoggedIn, noteId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || submitting || sending) return;

    setSending(true);
    try {
      if (isLoggedIn) {
        // Logged-in user: send auth token (no commenter creation needed)
        const newComment = await createComment.mutateAsync({
          body: { content: trimmed, parentId },
          rootCommentId,
        });

        setContent("");
        setIsFocused(false);
        setShowEmoji(false);
        onSubmit(apiCommentToComment(newComment));
        if (onCancel) onCancel();
      } else {
        // Anonymous: create commenter if needed, then comment
        if (!hasCommenter()) {
          try {
            const { commentersApi } = await import("@/lib/api");
            const result = await commentersApi.create(commenterName);
            setCommenterToken(result.token);
            setCommenterId(result.commenter.id);
            setCommenterNickname(result.commenter.nickname);
          } catch {
            message.error("Không tạo được tài khoản bình luận");
            return;
          }
        }

        const newComment = await createComment.mutateAsync({
          body: { content: trimmed, parentId, nickname: commenterName },
          rootCommentId,
        });

        setContent("");
        setIsFocused(false);
        setShowEmoji(false);
        onSubmit(apiCommentToComment(newComment));
        if (onCancel) onCancel();
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
    textareaRef.current?.focus();
  };

  const startEditName = () => {
    setNameDraft(commenterName);
    setEditingName(true);
  };

  const saveName = async () => {
    setEditingName(false);
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === commenterName) return;
    setCommenterNickname(trimmed);
  };

  const handleCancel = () => {
    setContent("");
    setIsFocused(false);
    if (onCancel) onCancel();
  };

  const showForm = isFocused || content || parentId;

  const isSelfReply =
    !!parentId && parentCommenterId != null && commenterId === parentCommenterId;

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
          {isLoggedIn ? (
            <span className={styles.nameButton}>
              {commenterName}{isPostAuthor && " (tác giả)"}
            </span>
          ) : editingName ? (
            <input
              className={styles.nameInput}
              value={nameDraft}
              maxLength={40}
              autoFocus
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void saveName();
                if (e.key === "Escape") setEditingName(false);
              }}
              onBlur={() => void saveName()}
            />
          ) : (
            <button
              type="button"
              className={styles.nameButton}
              onClick={startEditName}
              title="Bấm để đổi tên"
            >
              {commenterName} <EditOutlined />
            </button>
          )}
        </div>
      )}
      <div className={styles.inputRow}>
        {(isLoggedIn && userAvatar) ? (
          <Image
            src={userAvatar}
            alt={commenterName}
            width={32}
            height={32}
            className={styles.avatar}
            unoptimized
          />
        ) : (
          <div className={styles.avatar}>
            <UserOutlined />
          </div>
        )}
        <div className={styles.inputContainer}>
          {showForm ? (
            <form onSubmit={(e) => void handleSubmit(e)}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                placeholder={parentId ? `Trả lời @${parentAuthor}...` : "Viết bình luận..."}
                rows={compact ? 2 : 3}
                disabled={submitting}
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
                  disabled={!content.trim() || submitting || sending}
                >
                  {sending ? <span className={styles.spinner} /> : <SendOutlined />}
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
