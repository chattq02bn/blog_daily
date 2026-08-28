"use client";

import { useMemo, useState } from "react";
import { message } from "antd";
import { apiCommentToComment } from "@/lib/api/adapters";
import {
  useCommentsInfinite,
  useCreateComment,
  useDeleteComment,
  useRepliesInfinite,
  useToggleCommentReaction,
  useUpdateComment,
} from "@/hooks/use-api";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import styles from "./CommentList.module.scss";

interface CommentListProps {
  noteId: string;
}

type Flat = ReturnType<typeof apiCommentToComment>;

/* Infinite pagination có thể trả trùng phần ranh giới giữa 2 trang sau khi refetch -> phải lọc */
function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

interface ReplyingTo {
  targetId: string;
  parentAuthor: string;
  parentCommenterId: number;
  rootCommentId: string;
}

interface ThreadHandlers {
  noteId: string;
  replyingTo: ReplyingTo | null;
  submitting: boolean;
  onReplySubmitted: () => void;
  onCancelReply: () => void;
  onReply: (commentId: string, authorName: string, commenterId: number, rootCommentId: string) => void;
  onDelete: (comment: Flat) => Promise<void>;
  onSaveEdit: (comment: Flat, content: string) => Promise<void>;
  onToggleLike: (comment: Flat) => void;
}

/* Reply của một bình luận — lazy load theo trang, chỉ 2 cấp (cha → con) */
function RepliesSection({
  parent,
  handlers,
  expandedIds,
}: {
  parent: Flat;
  handlers: ThreadHandlers;
  expandedIds: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const shouldOpen = expandedIds.has(parent.id) || open;
  const count = parent.repliesCount ?? 0;

  const query = useRepliesInfinite(shouldOpen ? parent.id : null);
  const replies = useMemo(
    () =>
      dedupeById((query.data?.pages ?? []).flatMap((page) => page.data)).map(
        apiCommentToComment
      ),
    [query.data]
  );

  if (!shouldOpen) {
    if (count <= 0) return null;
    return (
      <div className={styles.replies}>
        <button className={styles.showRepliesButton} onClick={() => setOpen(true)}>
          Xem {count.toLocaleString("vi-VN")} phản hồi
          <span className={styles.toggleIcon}>^</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.replies}>
      {replies.map((reply, index) => (
        <div key={reply.id} className={styles.replyWrapper}>
          <Comment
            comment={reply}
            parentAuthor={undefined}
            onReply={() => handlers.onReply(reply.id, reply.author, reply.commenterId, parent.id)}
            onDelete={() => handlers.onDelete(reply)}
            onSaveEdit={(content) => handlers.onSaveEdit(reply, content)}
            onToggleLike={() => handlers.onToggleLike(reply)}
            isLast={
              index === replies.length - 1 &&
              (reply.repliesCount ?? 0) === 0 &&
              handlers.replyingTo?.targetId !== reply.id
            }
          />

          {handlers.replyingTo?.targetId === reply.id && (
            <div className={styles.replyForm}>
              <CommentForm
                noteId={handlers.noteId}
                parentId={reply.id}
                rootCommentId={parent.id}
                parentAuthor={reply.author}
                parentCommenterId={reply.commenterId}
                onSubmit={handlers.onReplySubmitted}
                onCancel={handlers.onCancelReply}
                submitting={handlers.submitting}
                compact
              />
            </div>
          )}
        </div>
      ))}

      {query.isFetching && replies.length === 0 && (
        <div className={styles.skeleton} />
      )}

      {query.hasNextPage && (
        <button
          className={styles.showMoreButton}
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
        >
          {query.isFetchingNextPage
            ? "Đang tải..."
            : `Xem thêm phản hồi (${(query.data?.pages[0]?.meta?.total ?? 0) - replies.length})`}
        </button>
      )}
    </div>
  );
}

export default function CommentList({ noteId }: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const query = useCommentsInfinite(noteId);
  const parents = useMemo(
    () =>
      dedupeById((query.data?.pages ?? []).flatMap((page) => page.data)).map(
        apiCommentToComment
      ),
    [query.data]
  );
  const totalRoots = query.data?.pages[0]?.meta?.total ?? 0;

  const createMutation = useCreateComment(noteId);
  const updateMutation = useUpdateComment();
  const deleteMutation = useDeleteComment();
  const reactionMutation = useToggleCommentReaction();

  const handleReply = (commentId: string, authorName: string, commenterId: number, rootCommentId: string) => {
    setReplyingTo({ targetId: commentId, parentAuthor: authorName, parentCommenterId: commenterId, rootCommentId });
  };

  const handleCancelReply = () => setReplyingTo(null);

  const handleDelete = async (comment: Flat) => {
    try {
      await deleteMutation.mutateAsync({ id: comment.id });
      message.success("Đã xóa bình luận");
    } catch {
      message.error("Không xóa được bình luận này");
    }
  };

  const handleEditSave = async (comment: Flat, content: string) => {
    await updateMutation.mutateAsync({
      id: comment.id,
      body: { content },
    });
    message.success("Đã cập nhật bình luận");
  };

  const handleToggleLike = (comment: Flat) => {
    reactionMutation.mutate({ id: comment.id, emoji: "❤️" });
  };

  if (query.isPending && parents.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
      </div>
    );
  }

  return (
    <div className={styles.commentList}>
      <div className={styles.header}>
        <h3 className={styles.title}>Bình luận {totalRoots.toLocaleString("vi-VN")}</h3>
      </div>

      <CommentForm
        noteId={noteId}
        parentId={null}
        onSubmit={() => setReplyingTo(null)}
        submitting={createMutation.isPending}
      />

      <div className={styles.comments}>
        {parents.length === 0 ? (
          <div className={styles.empty}>
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          parents.map((parent) => {
            const handlers: ThreadHandlers = {
              noteId,
              replyingTo,
              submitting: createMutation.isPending,
              onReplySubmitted: () => {
                if (replyingTo) {
                  setExpandedIds((prev) => new Set(prev).add(replyingTo.rootCommentId));
                }
                setReplyingTo(null);
              },
              onCancelReply: () => setReplyingTo(null),
              onReply: handleReply,
              onDelete: handleDelete,
              onSaveEdit: handleEditSave,
              onToggleLike: handleToggleLike,
            };

            return (
              <div key={parent.id} className={styles.commentWrapper}>
                <Comment
                  comment={parent}
                  onReply={() => handleReply(parent.id, parent.author, parent.commenterId, parent.id)}
                  onDelete={() => void handleDelete(parent)}
                  onSaveEdit={(content) => void handleEditSave(parent, content)}
                  onToggleLike={() => handleToggleLike(parent)}
                />

                {replyingTo?.targetId === parent.id && (
                  <div className={styles.replyForm}>
                    <CommentForm
                      noteId={noteId}
                      parentId={parent.id}
                      rootCommentId={parent.id}
                      parentAuthor={replyingTo.parentAuthor}
                      parentCommenterId={replyingTo.parentCommenterId}
                      onSubmit={() => setReplyingTo(null)}
                      onCancel={handleCancelReply}
                      submitting={createMutation.isPending}
                      compact
                    />
                  </div>
                )}

                <RepliesSection parent={parent} handlers={handlers} expandedIds={expandedIds} />
              </div>
            );
          })
        )}

        {query.hasNextPage && (
          <button
            className={styles.showMoreButton}
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          >
            {query.isFetchingNextPage
              ? "Đang tải..."
              : `Xem thêm bình luận (${(totalRoots - parents.length).toLocaleString("vi-VN")})`}
          </button>
        )}
      </div>
    </div>
  );
}
