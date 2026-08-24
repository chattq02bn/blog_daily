"use client";

import { useState, useCallback, useMemo } from "react";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import {
  loadComments,
  getCommentsWithHierarchy,
  getCurrentUser,
  EMOJIS,
  CommentEmoji,
  Comment as CommentType,
} from "@/lib/commentStorage";
import styles from "./CommentList.module.scss";

interface CommentListProps {
  noteId: string;
  currentUserId?: string;
}

const noEmojis = () => ({}) as Record<CommentEmoji, number>;
const noReactions = () => ({}) as Record<CommentEmoji, boolean>;

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
      emojis: noEmojis(),
      userReactions: noReactions(),
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
      emojis: noEmojis(),
      userReactions: noReactions(),
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
      emojis: noEmojis(),
      userReactions: noReactions(),
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
      content: "Cảm ơn tác giả đã đúc kết những kinh nghiệm quý báu!",
      emojis: noEmojis(),
      userReactions: noReactions(),
      createdAt: new Date(Date.now() - 900000).toISOString(),
      updatedAt: new Date(Date.now() - 900000).toISOString(),
      isEdited: false,
    },
    ...[
      ["fake_5", null, "Gia Hưng", 47, "Chờ phần tiếp theo của bài này quá!"],
      ["fake_6", "fake_5", "Bảo Ngọc", 44, "Mình cũng đang mong phần 2 nè."],
      ["fake_7", null, "Đức Anh", 40, "Lưu lại đọc dần, bài rất chất lượng."],
      ["fake_8", null, "Hải Yến", 35, "Hình ảnh minh họa đẹp quá trời."],
      ["fake_9", "fake_8", "Quang Linh", 30, "Đúng vậy, nhìn đã mắt luôn."],
      ["fake_10", null, "Thanh Hà", 26, "Áp dụng ngay cho tuần này thôi!"],
      ["fake_11", null, "Minh Quân", 20, "Có ai biết tài liệu nào liên quan không ạ?"],
      ["fake_12", "fake_11", "Khánh Vy", 16, "Bạn tham khảo thêm ở phần tag cuối bài nhé."],
      ["fake_13", null, "Tuấn Kiệt", 12, "Đọc xong động lực tăng hẳn luôn."],
      ["fake_14", null, "Ngọc Mai", 8, "Cảm ơn bạn nhiều nhé!"],
      // Chuỗi 3 cấp: fake_1 (ông) → fake_2 (cha) → fake_15 (cháu)
      ["fake_15", "fake_2", "Chí Thanh", 50, "Hai bác nói đúng quá, mình cũng thấy vậy!"],
      // Chuỗi 3 cấp: fake_5 → fake_6 → fake_16
      ["fake_16", "fake_6", "Hoài Nam", 42, "Phần 2 chắc chắn có, tác giả bảo rồi mà."],
      // Cấp 4 sẽ được gộp vào cấp cháu của thread fake_5
      ["fake_17", "fake_16", "Kim Ngân", 38, "Vậy chờ bản cập nhật thôi mọi người ơi!"],
      ["fake_18", "fake_12", "Trọng Tín", 14, "Cảm ơn bạn, để mình xem thử nhé."],
      ["fake_19", null, "Ánh Dương", 6, "Bài viết đỉnh thật sự, chia sẻ ngay cho hội bạn thân!"],
      ["fake_20", null, " Quốc Bảo", 4, "Đây chính là thứ mình đang tìm kiếm bấy lâu."],
      ["fake_21", null, "Mỹ Duyên", 3, "Màu sắc và layout bài này dễ thương quá!"],
      ["fake_22", "fake_21", "Hữu Phước", 2, "Tác giả phối màu theo tông pastel đó bạn."],
      ["fake_23", null, "Bảo Trâm", 1, "Like mạnh cho tác giả nào!"],
    ].map(([id, parentId, author, minutesAgo, content]) => ({
      id: id as string,
      noteId,
      parentId: parentId as string | null,
      author: author as string,
      authorAvatar: `https://i.pravatar.cc/96?img=${(Number(minutesAgo) % 70) + 2}`,
      content: content as string,
      emojis: noEmojis(),
      userReactions: noReactions(),
      createdAt: new Date(Date.now() - Number(minutesAgo) * 60000).toISOString(),
      updatedAt: new Date(Date.now() - Number(minutesAgo) * 60000).toISOString(),
      isEdited: false,
    })),
  ];

  const initialEmojis = {} as Record<CommentEmoji, number>;
  const initialReactions = {} as Record<CommentEmoji, boolean>;
  EMOJIS.forEach((e) => {
    initialEmojis[e] = 0;
    initialReactions[e] = false;
  });

  const seedLikes: Record<string, number> = {
    fake_1: 24,
    fake_2: 8,
    fake_3: 15,
    fake_4: 3,
    fake_5: 11,
    fake_6: 5,
    fake_7: 6,
    fake_8: 9,
    fake_10: 4,
    fake_12: 2,
    fake_15: 7,
    fake_19: 13,
    fake_21: 6,
    fake_23: 18,
  };

  fakeComments.forEach((c) => {
    c.emojis = { ...initialEmojis, "❤️": seedLikes[c.id] || 0 };
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

interface ReplyingTo {
  targetId: string;
  parentAuthor: string;
}

function collectDescendants(
  commentId: string,
  childrenMap: Record<string, CommentType[]>
): CommentType[] {
  const direct = childrenMap[commentId] || [];
  return direct.flatMap((c) => [c, ...collectDescendants(c.id, childrenMap)]);
}

export default function CommentList({ noteId, currentUserId }: CommentListProps) {
  const PAGE_SIZE = 10;
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const [showAllReplies, setShowAllReplies] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const initialData = useMemo(() => getInitialComments(noteId), [noteId]);
  const [parents, setParents] = useState<CommentType[]>(initialData.parents);
  const [children, setChildren] = useState<Record<string, CommentType[]>>(initialData.children);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);
  const [loading, setLoading] = useState(false);
  const [prevNoteId, setPrevNoteId] = useState(noteId);
  const [userName, setUserName] = useState(() => getCurrentUser().name);

  if (prevNoteId !== noteId) {
    setPrevNoteId(noteId);
    setParents(initialData.parents);
    setChildren(initialData.children);
    setTotalCount(initialData.totalCount);
    setShowAllReplies({});
    setVisibleCount(PAGE_SIZE);
    setReplyingTo(null);
  }

  const loadCommentsData = useCallback(() => {
    setLoading(true);
    const { parents: p, children: c } = getCommentsWithHierarchy(noteId);
    setParents(p);
    setChildren(c);
    const allComments = loadComments(noteId);
    setTotalCount(allComments.length);
    setLoading(false);
  }, [noteId]);

  const getAuthorOf = useCallback(
    (commentId: string): string | undefined => {
      const parent = parents.find((c) => c.id === commentId);
      if (parent) return parent.author;
      for (const list of Object.values(children)) {
        const child = list.find((c) => c.id === commentId);
        if (child) return child.author;
      }
      return undefined;
    },
    [parents, children]
  );

  const getThreadAncestorIds = useCallback(
    (commentId: string): string[] => {
      const parentOf = (cid: string): string | undefined => {
        if (parents.some((p) => p.id === cid)) return undefined;
        for (const [pid, list] of Object.entries(children)) {
          if (list.some((c) => c.id === cid)) return pid;
        }
        return undefined;
      };
      const chain: string[] = [];
      let cur = parentOf(commentId);
      while (cur) {
        chain.push(cur);
        cur = parentOf(cur);
      }
      return chain;
    },
    [parents, children]
  );

  const handleReply = useCallback(
    (commentId: string, authorName: string) => {
      for (const ancestorId of getThreadAncestorIds(commentId)) {
        setShowAllReplies((prev) => ({ ...prev, [ancestorId]: true }));
      }
      setReplyingTo({ targetId: commentId, parentAuthor: authorName });
    },
    [getThreadAncestorIds]
  );

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

  const handleProfileChange = useCallback(() => {
    setUserName(getCurrentUser().name);
    loadCommentsData();
  }, [loadCommentsData]);

  const getDisplayParentAuthor = useCallback(
    (child: CommentType): string | undefined => {
      if (!child.parentId) return undefined;
      const author = getAuthorOf(child.parentId);
      return author && author === userName ? undefined : author;
    },
    [getAuthorOf, userName]
  );

  const getDirectChildren = (parentId: string): CommentType[] => {
    return [...(children[parentId] || [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };

  const getGrandChildren = (kidId: string): CommentType[] => {
    const direct = children[kidId] || [];
    const directIds = new Set(direct.map((c) => c.id));
    const deeper = collectDescendants(kidId, children).filter(
      (c) => !directIds.has(c.id)
    );
    return [...direct, ...deeper].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };

  const hasReplies = (parentId: string) => {
    return collectDescendants(parentId, children).length > 0;
  };

  const visibleParents = useMemo(
    () => parents.slice(0, visibleCount),
    [parents, visibleCount]
  );
  const hiddenParentCount = Math.max(0, parents.length - visibleParents.length);

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
        <h3 className={styles.title}>Bình luận {totalCount.toLocaleString("vi-VN")}</h3>
      </div>

      <CommentForm
        noteId={noteId}
        parentId={null}
        onSubmit={handleCommentChange}
        onProfileChange={handleProfileChange}
      />

      <div className={styles.comments}>
        {parents.length === 0 ? (
          <div className={styles.empty}>
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          visibleParents.map((parent) => (
            <div key={parent.id} className={styles.commentWrapper}>
              <Comment
                comment={parent}
                onReply={handleReply}
                onDataChange={handleDelete}
                isCurrentUser={parent.author === currentUserId}
                depth={0}
              />

              {replyingTo?.targetId === parent.id && (
                <div className={styles.replyForm}>
                  <CommentForm
                    noteId={noteId}
                    parentId={replyingTo.targetId}
                    parentAuthor={replyingTo.parentAuthor}
                    onSubmit={handleCommentChange}
                    onCancel={handleCancelReply}
                    compact
                  />
                </div>
              )}

              {hasReplies(parent.id) && (
                <div className={styles.replies}>
                  {showAllReplies[parent.id] ? (
                    <>
                      {getDirectChildren(parent.id).map((child, index) => {
                        const grandKids = getGrandChildren(child.id);
                        return (
                          <div key={child.id} className={styles.replyWrapper}>
                            <Comment
                              comment={child}
                              parentAuthor={getDisplayParentAuthor(child)}
                              onReply={handleReply}
                              onDataChange={handleDelete}
                              isCurrentUser={child.author === currentUserId}
                              depth={1}
                              isLast={
                                index === getDirectChildren(parent.id).length - 1 &&
                                grandKids.length === 0 &&
                                replyingTo?.targetId !== child.id
                              }
                            />

                            {replyingTo?.targetId === child.id && (
                              <div className={styles.replyForm}>
                                <CommentForm
                                  noteId={noteId}
                                  parentId={replyingTo.targetId}
                                  parentAuthor={replyingTo.parentAuthor}
                                  onSubmit={handleCommentChange}
                                  onCancel={handleCancelReply}
                                  compact
                                />
                              </div>
                            )}

                            {grandKids.length > 0 && (
                              <div className={styles.nestedReplies}>
                                {grandKids.map((g, gi) => (
                                  <div key={g.id} className={styles.replyWrapper}>
                                    <Comment
                                      comment={g}
                                      parentAuthor={getDisplayParentAuthor(g)}
                                      onReply={handleReply}
                                      onDataChange={handleDelete}
                                      isCurrentUser={g.author === currentUserId}
                                      depth={2}
                                      isLast={
                                        gi === grandKids.length - 1 &&
                                        replyingTo?.targetId !== g.id
                                      }
                                    />

                                    {replyingTo?.targetId === g.id && (
                                      <div className={styles.replyForm}>
                                        <CommentForm
                                          noteId={noteId}
                                          parentId={replyingTo.targetId}
                                          parentAuthor={replyingTo.parentAuthor}
                                          onSubmit={handleCommentChange}
                                          onCancel={handleCancelReply}
                                          compact
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <button
                      className={styles.showRepliesButton}
                      onClick={() => setShowAllReplies((prev) => ({ ...prev, [parent.id]: true }))}
                    >
                      Trả lời {collectDescendants(parent.id, children).length}
                      <span className={styles.toggleIcon}>^</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {hiddenParentCount > 0 && (
          <button
            className={styles.showMoreButton}
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            Xem thêm bình luận ({hiddenParentCount})
          </button>
        )}
      </div>
    </div>
  );
}
