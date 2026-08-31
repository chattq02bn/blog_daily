"use client";

export type CommentEmoji =
  | "👍"
  | "❤️"
  | "😂"
  | "😮"
  | "😢"
  | "😡"
  | "👏"
  | "🙏";

export interface CommentEmojiCount {
  emoji: CommentEmoji;
  count: number;
  hasReacted: boolean;
}

export interface Comment {
  id: string;
  noteId: string;
  parentId: string | null;
  commenterId: number;
  author: string;
  authorAvatar: string;
  isAuthor: boolean;
  parentAuthor?: string;
  content: string;
  emojis: Record<CommentEmoji, number>;
  userReactions: Record<CommentEmoji, boolean>;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  /** Số reply trực tiếp — để lazy-load phân trang */
  repliesCount?: number;
}

export interface CommentFormData {
  content: string;
  parentId?: string | null;
}

const STORAGE_KEY = "note_comments";
const EMOJIS: CommentEmoji[] = ["👍", "❤️", "😂", "😮", "😢", "😡", "👏", "🙏"];

function generateId(): string {
  return `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getStoredComments(): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveComments(comments: Comment[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

export function loadComments(noteId: string): Comment[] {
  const allComments = getStoredComments();
  return allComments.filter((c) => c.noteId === noteId);
}

export function getCommentById(commentId: string): Comment | undefined {
  const allComments = getStoredComments();
  return allComments.find((c) => c.id === commentId);
}

export function createComment(
  noteId: string,
  author: string,
  authorAvatar: string,
  content: string,
  parentId: string | null = null
): Comment {
  const allComments = getStoredComments();
  const now = new Date().toISOString();

  const initialEmojis: Record<CommentEmoji, number> = {} as Record<CommentEmoji, number>;
  const initialUserReactions: Record<CommentEmoji, boolean> = {} as Record<CommentEmoji, boolean>;
  EMOJIS.forEach((emoji) => {
    initialEmojis[emoji] = 0;
    initialUserReactions[emoji] = false;
  });

  const newComment: Comment = {
    id: generateId(),
    noteId,
    parentId,
    commenterId: 0,
    author,
    authorAvatar,
    isAuthor: false,
    content,
    emojis: initialEmojis,
    userReactions: initialUserReactions,
    createdAt: now,
    updatedAt: now,
    isEdited: false,
  };

  allComments.push(newComment);
  saveComments(allComments);
  return newComment;
}

export function updateComment(
  commentId: string,
  content: string
): Comment | undefined {
  const allComments = getStoredComments();
  const index = allComments.findIndex((c) => c.id === commentId);
  if (index === -1) return undefined;

  allComments[index] = {
    ...allComments[index],
    content,
    updatedAt: new Date().toISOString(),
    isEdited: true,
  };
  saveComments(allComments);
  return allComments[index];
}

export function deleteComment(commentId: string): boolean {
  const allComments = getStoredComments();
  const index = allComments.findIndex((c) => c.id === commentId);
  if (index === -1) return false;

  const hasChildren = allComments.some((c) => c.parentId === commentId);
  if (hasChildren) {
    allComments.splice(index, 1);
    saveComments(allComments);
    return true;
  }

  allComments.splice(index, 1);
  saveComments(allComments);
  return true;
}

export function toggleEmojiReaction(
  commentId: string,
  emoji: CommentEmoji
): Comment | undefined {
  const allComments = getStoredComments();
  const index = allComments.findIndex((c) => c.id === commentId);
  if (index === -1) return undefined;

  const comment = allComments[index];
  const hasReacted = comment.userReactions[emoji];

  comment.emojis[emoji] = hasReacted
    ? Math.max(0, comment.emojis[emoji] - 1)
    : comment.emojis[emoji] + 1;
  comment.userReactions[emoji] = !hasReacted;

  saveComments(allComments);
  return comment;
}

export function getCommentEmojiCounts(comment: Comment): CommentEmojiCount[] {
  return EMOJIS.map((emoji) => ({
    emoji,
    count: comment.emojis[emoji] || 0,
    hasReacted: comment.userReactions[emoji] || false,
  }));
}

export function getCommentsWithHierarchy(noteId: string): {
  parents: Comment[];
  children: Record<string, Comment[]>;
} {
  const comments = loadComments(noteId);
  const parents = comments.filter((c) => c.parentId === null).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const children: Record<string, Comment[]> = {};

  comments
    .filter((c) => c.parentId !== null)
    .forEach((child) => {
      if (!children[child.parentId!]) {
        children[child.parentId!] = [];
      }
      children[child.parentId!].push(child);
    });

  Object.values(children).forEach((arr) => {
    arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  return { parents, children };
}

export function updateUser(name: string): boolean {
  if (typeof window === "undefined") return false;
  const trimmed = name.trim();
  if (!trimmed) return false;

  const userStr = localStorage.getItem("note_user");
  let user: { name?: string; avatar?: string } = {};
  try {
    user = userStr ? JSON.parse(userStr) : {};
  } catch { }

  const oldName = user.name || "Người dùng";
  user.name = trimmed;
  localStorage.setItem("note_user", JSON.stringify(user));

  const allComments = getStoredComments();
  let changed = false;
  allComments.forEach((c) => {
    if (c.author === oldName) {
      c.author = trimmed;
      changed = true;
    }
  });
  if (changed) saveComments(allComments);
  return true;
}

export function getCurrentUser(): { id: number | null; name: string; avatar: string } {
  if (typeof window === "undefined") {
    return { id: null, name: "Người dùng", avatar: "https://picsum.photos/seed/user/96/96" };
  }
  try {
    const userStr = localStorage.getItem("note_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: user.id != null ? Number(user.id) : null,
        name: user.name || "Người dùng",
        avatar: user.avatar ?? "",
      };
    }
  } catch { }
  return { id: null, name: "Người dùng", avatar: "" };
}

export { EMOJIS };

const ANON_LIKES_KEY = "note_anon_likes";

export function getAnonLikes(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(ANON_LIKES_KEY) || "{}");
  } catch {
    return {};
  }
}

export function toggleAnonLike(commentId: string, emoji: string): boolean {
  if (typeof window === "undefined") return false;
  const likes = getAnonLikes();
  const key = `${commentId}:${emoji}`;
  const arr = likes[key] || [];
  const idx = arr.indexOf(emoji);
  let active: boolean;
  if (idx >= 0) {
    arr.splice(idx, 1);
    active = false;
  } else {
    arr.push(emoji);
    active = true;
  }
  if (arr.length > 0) {
    likes[key] = arr;
  } else {
    delete likes[key];
  }
  localStorage.setItem(ANON_LIKES_KEY, JSON.stringify(likes));
  return active;
}

export function hasAnonLike(commentId: string, emoji: string): boolean {
  const likes = getAnonLikes();
  const key = `${commentId}:${emoji}`;
  return (likes[key]?.length ?? 0) > 0;
}