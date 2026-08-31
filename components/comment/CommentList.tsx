"use client";

import { useMemo, useState } from "react";
import { App } from "antd";
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
  authorId?: number;
}

type Flat = ReturnType<typeof apiCommentToComment>;
export type { Flat };

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
  authorId?: number;
  replyingTo: ReplyingTo | null;
  submitting: boolean;
  onReplySubmitted: (optimisticReply: Flat) => void;
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
  optimisticReplies,
}: {
  parent: Flat;
  handlers: ThreadHandlers;
  optimisticReplies: Flat[];
}) {
  const [open, setOpen] = useState(false);
  const count = parent.repliesCount ?? 0;

  const query = useRepliesInfinite(open ? parent.id : null);
  const replies = useMemo(() => {
    const queryReplies = (query.data?.pages ?? [])
      .flatMap((page) => page.data)
      .map(apiCommentToComment);
    return dedupeById([...optimisticReplies, ...queryReplies]);
  }, [query.data, optimisticReplies]);

  const totalCount = count + optimisticReplies.length;

  /* Collapsed: show inline optimistic replies + button */
  if (!open) {
    if (totalCount <= 0) return null;
    return (
      <div className={styles.replies}>
        {optimisticReplies.map((reply) => (
          <div key={reply.id} className={styles.replyWrapper}>
            <Comment
              comment={reply}
              parentAuthor={undefined}
              onReply={() => handlers.onReply(reply.id, reply.author, reply.commenterId, parent.id)}
              onDelete={() => handlers.onDelete(reply)}
              onSaveEdit={(content) => handlers.onSaveEdit(reply, content)}
              onToggleLike={() => handlers.onToggleLike(reply)}
              isLast={false}
            />
          </div>
        ))}

        <span className={styles.showRepliesButton} onClick={() => setOpen(true)}>
          Xem {count.toLocaleString("vi-VN")} phản hồi
          <span className={styles.toggleIcon}>^</span>
        </span>
      </div>
    );
  }

  /* Expanded: full reply list from server + optimistic */
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
                onSubmit={(optimisticReply) => handlers.onReplySubmitted(optimisticReply)}
                onCancel={handlers.onCancelReply}
                submitting={handlers.submitting}
                authorId={handlers.authorId}
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

export default function CommentList({ noteId, authorId }: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const [optimisticRepliesMap, setOptimisticRepliesMap] = useState<Record<string, Flat[]>>({});
  const { message } = App.useApp();

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

  const handleReplySubmitted = (rootCommentId: string, optimisticReply: Flat) => {
    setOptimisticRepliesMap((prev) => ({
      ...prev,
      [rootCommentId]: [...(prev[rootCommentId] ?? []), optimisticReply],
    }));
    setReplyingTo(null);
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
        authorId={authorId}
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
              authorId,
              replyingTo,
              submitting: createMutation.isPending,
              onReplySubmitted: (optimisticReply) => handleReplySubmitted(parent.id, optimisticReply),
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
                      onSubmit={(optimisticReply) => handleReplySubmitted(parent.id, optimisticReply)}
                      onCancel={handleCancelReply}
                      submitting={createMutation.isPending}
                      authorId={authorId}
                      compact
                    />
                  </div>
                )}

                <RepliesSection
                  parent={parent}
                  handlers={handlers}
                  optimisticReplies={optimisticRepliesMap[parent.id] ?? []}
                />
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
