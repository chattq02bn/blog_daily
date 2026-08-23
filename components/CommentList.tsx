"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import {
  loadComments,
  getCommentsWithHierarchy,
  createComment,
  Comment as CommentType,
} from "@/lib/commentStorage";
import styles from "./CommentList.module.scss";

interface CommentListProps {
  noteId: string;
  currentUserId?: string;
}

function seedFakeComments(noteId: string) {
  const stored = localStorage.getItem("note_comments");
  const all = stored ? JSON.parse(stored) : [];
  const existing = all.filter((c: CommentType) => c.noteId === noteId);
  if (existing.length > 0) return;

  const fakeComments: CommentType[] = [
    {
      id: "fake_1",
      noteId,
      parentId: null,
      author: "Minh Anh",
      authorAvatar: "https://i.pravatar.cc/96?img=1",
      content: "Bài viết rất hay và hữu ích! Cảm ơn bạn đã chia sẻ.",
      emojis: {} as any,
      userReactions: {} as any,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      isEdited: false,
    },
    {
      id: "fake_2",
      noteId,
      parentId: "fake_1",
      author: "Tuấn Minh",
      authorAvatar: "https://i.pravatar.cc/96?img=3",
      content: "Đồng ý với bạn! Mình cũng rất thích phần này.",
      emojis: {} as any,
      userReactions: {} as any,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      isEdited: false,
    },
    {
      id: "fake_3",
      noteId,
      parentId: null,
      author: "Hoàng Hà",
      authorAvatar: "https://i.pravatar.cc/96?img=5",
      content: "Mình muốn tìm hiểu thêm về chủ đề này. Bạn có thể viết thêm được không?",
      emojis: {} as any,
      userReactions: {} as any,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      isEdited: false,
    },
    {
      id: "fake_4",
      noteId,
      parentId: null,
      author: "Thu Trang",
      authorAvatar: "https://i.pravatar.cc/96?img=9",
      content: "Cảm ơn tác giả đã đúc kết những kinh nghiệm quý báu这样!",
      emojis: {} as any,
      userReactions: {} as any,
      createdAt: new Date(Date.now() - 900000).toISOString(),
      updatedAt: new Date(Date.now() - 900000).toISOString(),
      isEdited: false,
    },
  ];

  const initialEmojis = {} as any;
  const initialReactions = {} as any;
  ["👍", "❤️", "😂", "😮", "😢", "😡", "👏", "🙏"].forEach((e) => {
    initialEmojis[e] = 0;
    initialReactions[e] = false;
  });

  fakeComments.forEach((c) => {
    c.emojis = { ...initialEmojis };
    c.userReactions = { ...initialReactions };
  });

  all.push(...fakeComments);
  localStorage.setItem("note_comments", JSON.stringify(all));
}

function getInitialComments(noteId: string) {
  seedFakeComments(noteId);
  const { parents, children } = getCommentsWithHierarchy(noteId);
  const allComments = loadComments(noteId);
  return { parents, children, totalCount: allComments.length };
}

export default function CommentList({ noteId, currentUserId }: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<{ parentId: string; parentAuthor: string } | null>(null);
  const [showAllReplies, setShowAllReplies] = useState<Record<string, boolean>>({});

  const initialData = useMemo(() => getInitialComments(noteId), [noteId]);
  const [parents, setParents] = useState<CommentType[]>(initialData.parents);
  const [children, setChildren] = useState<Record<string, CommentType[]>>(initialData.children);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);
  const [loading, setLoading] = useState(false);

  const loadCommentsData = useCallback(() => {
    setLoading(true);
    const { parents: p, children: c } = getCommentsWithHierarchy(noteId);
    setParents(p);
    setChildren(c);
    const allComments = loadComments(noteId);
    setTotalCount(allComments.length);
    setLoading(false);
  }, [noteId]);

  useEffect(() => {
    loadCommentsData();
  }, [loadCommentsData]);

  const handleReply = useCallback((parentId: string, parentAuthor: string) => {
    setReplyingTo({ parentId, parentAuthor });
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleCommentChange = useCallback(() => {
    loadCommentsData();
    setReplyingTo(null);
  }, [loadCommentsData]);

  const handleDelete = useCallback(() => {
    loadCommentsData();
  }, [loadCommentsData]);

  const getChildComments = (parentId: string) => {
    return children[parentId] || [];
  };

  const hasReplies = (parentId: string) => {
    return (children[parentId]?.length || 0) > 0;
  };

  if (loading) {
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
        <h3 className={styles.title}>Bình luận {totalCount.toLocaleString()}</h3>
      </div>

      <CommentForm
        noteId={noteId}
        parentId={null}
        onSubmit={handleCommentChange}
      />

      {replyingTo && (
        <div className={styles.replyForm}>
          <CommentForm
            noteId={noteId}
            parentId={replyingTo.parentId}
            parentAuthor={replyingTo.parentAuthor}
            onSubmit={handleCommentChange}
            onCancel={handleCancelReply}
            compact
          />
        </div>
      )}

      <div className={styles.comments}>
        {parents.length === 0 ? (
          <div className={styles.empty}>
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          parents.map((parent) => (
            <div key={parent.id} className={styles.commentWrapper}>
              <Comment
                comment={parent}
                onReply={handleReply}
                onDelete={handleDelete}
                isCurrentUser={parent.author === currentUserId}
                depth={0}
              />

              {hasReplies(parent.id) && (
                <div className={styles.replies}>
                  {showAllReplies[parent.id] ? (
                    <>
                      {getChildComments(parent.id).map((child, index) => (
                        <div key={child.id} className={styles.replyWrapper}>
                          <Comment
                            comment={child}
                            parentAuthor={parent.author}
                            onReply={handleReply}
                            onDelete={handleDelete}
                            isCurrentUser={child.author === currentUserId}
                            depth={1}
                            isLast={index === getChildComments(parent.id).length - 1}
                          />
                        </div>
                      ))}
                    </>
                  ) : (
                    <button
                      className={styles.showRepliesButton}
                      onClick={() => setShowAllReplies((prev) => ({ ...prev, [parent.id]: true }))}
                    >
                      Trả lời {getChildComments(parent.id).length}
                      <span className={styles.toggleIcon}>^</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
