export const LIKED_COMMENTS_COOKIE = "note_liked_comments";

const LIKED_KEY = "note_comment_likes";

const COOKIE_MAX_IDS = 40;

const COOKIE_MAX_AGE = 180 * 24 * 3600;

type Listener = () => void;
const listeners = new Set<Listener>();

let cache: Record<string, boolean> | null = null;

function readMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  if (!cache) {
    try {
      cache = JSON.parse(localStorage.getItem(LIKED_KEY) || "{}");
    } catch {
      cache = {};
    }
  }
  return cache!;
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function writeCookie(map: Record<string, boolean>): void {
  if (typeof document === "undefined") return;
  const ids = Object.keys(map)
    .filter((id) => map[id])
    .slice(-COOKIE_MAX_IDS);
  document.cookie = `${LIKED_COMMENTS_COOKIE}=${encodeURIComponent(ids.join(","))}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function ensureCookieSynced(): void {
  if (typeof document === "undefined") return;
  if (document.cookie.includes(`${LIKED_COMMENTS_COOKIE}=`)) return;
  writeCookie(readMap());
}

export function isCommentLiked(commentId: string): boolean {
  return Boolean(readMap()[commentId]);
}

export function getLikedMap(): Record<string, boolean> {
  return readMap();
}

export function setCommentLiked(commentId: string, liked: boolean): boolean {
  const map = readMap();
  if (Boolean(map[commentId]) === liked) return liked;
  if (liked) {
    map[commentId] = true;
  } else {
    delete map[commentId];
  }
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(map));
  } catch {
    /* storage full — still update UI + cookie */
  }
  writeCookie(map);
  notify();
  return liked;
}

export function toggleCommentLiked(commentId: string): boolean {
  return setCommentLiked(commentId, !isCommentLiked(commentId));
}

export function subscribeCommentLikes(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function parseLikedCommentIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}
