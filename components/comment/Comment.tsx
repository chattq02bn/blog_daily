"use client";

import { useState } from "react";
import Image from "next/image";
import {
  EllipsisOutlined,
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Popover, Modal } from "antd";
import CommentLikeButton from "@/components/likes/CommentLikeButton";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { Comment as CommentType } from "@/lib/commentStorage";
import styles from "./Comment.module.scss";

interface CommentProps {
  comment: CommentType;
  parentAuthor?: string;
  parentCommenterId?: number;
  onReply?: (parentId: string, parentAuthor: string, commenterId: number) => void;
  onDelete: () => void;
  onSaveEdit: (content: string) => void;
  isLast?: boolean;
}

export default function Comment({
  comment,
  parentAuthor,
  parentCommenterId,
  onReply,
  onDelete,
  onSaveEdit,
  isLast = false,
}: CommentProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const myId = typeof window !== "undefined" ? Number(localStorage.getItem("note_commenter_id") || "0") : 0;
  const isOwner = myId > 0 && myId === comment.commenterId;

  const handleEdit = () => {
    setPopoverOpen(false);
    setEditing(true);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    onSaveEdit(trimmed);
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditContent(comment.content);
  };

  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  };

  return (
    <div className={`${styles.comment} ${isLast ? styles.last : ""}`}>
      <div className={styles.commentMain}>
        {comment.authorAvatar ? (
          <Image
            src={comment.authorAvatar}
            alt={comment.author}
            width={36}
            height={36}
            className={styles.avatar}
            unoptimized
          />
        ) : (
          <div className={styles.avatar}>
            <UserOutlined />
          </div>
        )}
        <div className={styles.commentBody}>
          <div className={styles.commentHeader}>
            <span className={styles.authorName}>
              {comment.author}
              {comment.isAuthor && <span className={styles.authorBadge}> (tác giả)</span>}
            </span>
            {comment.parentAuthor && comment.parentAuthor !== comment.author && (
              <span className={styles.replyTo}>
                <span className={styles.replyArrow}>→</span> {comment.parentAuthor}
              </span>
            )}
            <time className={styles.commentTime} dateTime={comment.createdAt}>
              {formatDate(comment.createdAt)}
            </time>
            {comment.isEdited && (
              <span className={styles.editedBadge}>Đã chỉnh sửa</span>
            )}
          </div>

          {editing ? (
            <div className={styles.editForm}>
              <textarea
                className={styles.editTextarea}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                placeholder="Viết bình luận..."
                autoFocus
              />
              <div className={styles.editActions}>
                <button className={styles.btnCancel} onClick={handleCancelEdit}>
                  Hủy
                </button>
                <button className={styles.btnSave} onClick={handleSaveEdit}>
                  Lưu
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.commentContent}>{comment.content}</div>
          )}

          <div className={styles.commentFooter}>
            <CommentLikeButton commentId={comment.id} likes={comment.likes ?? 0} />
            {onReply && (
              <button
                className={styles.actionButton}
                onClick={() => onReply(comment.id, comment.author, comment.commenterId)}
                aria-label="Trả lời"
              >
                <MessageOutlined />
              </button>
            )}
            {isOwner && (
              <Popover
                content={
                  <div className={styles.popoverMenu}>
                    <div className={styles.popoverItem} onClick={handleEdit}>
                      <EditOutlined /> Chỉnh sửa
                    </div>
                    <div
                      className={styles.popoverItem}
                      onClick={() => { setPopoverOpen(false); setShowDeleteConfirm(true); }}
                    >
                      <DeleteOutlined /> Xóa
                    </div>
                  </div>
                }
                trigger="click"
                open={popoverOpen}
                onOpenChange={setPopoverOpen}
              >
                <button className={styles.actionButton} aria-label="Tùy chọn">
                  <EllipsisOutlined />
                </button>
              </Popover>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showDeleteConfirm}
        onOk={() => {
          setShowDeleteConfirm(false);
          onDelete();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Xóa bình luận"
        okText="Xóa"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
        width={400}
      >
        Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
      </Modal>
    </div>
  );
}
