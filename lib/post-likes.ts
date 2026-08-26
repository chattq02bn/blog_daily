export const LIKED_POSTS_COOKIE = "note_liked_posts";

/** Key localStorage giữ nguyên từ bản cũ để không mất like người dùng đã thả */
const LIKED_KEY = "note_card_likes";

/** Giới hạn số id ghi vào cookie (tránh vượt giới hạn 4KB) */
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

/** Mirror sang cookie để server render đúng trạng thái tym ngay lần đầu (không nhấp nháy sau F5) */
function writeCookie(map: Record<string, boolean>): void {
  if (typeof document === "undefined") return;
  const ids = Object.keys(map)
    .filter((id) => map[id])
    .slice(-COOKIE_MAX_IDS);
  document.cookie = `${LIKED_POSTS_COOKIE}=${encodeURIComponent(ids.join(","))}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

/** Lần đầu tiên sau khi nâng cấp: đẩy like trong localStorage lên cookie nếu cookie chưa có */
export function ensureCookieSynced(): void {
  if (typeof document === "undefined") return;
  if (document.cookie.includes(`${LIKED_POSTS_COOKIE}=`)) return;
  writeCookie(readMap());
}

export function isPostLiked(postId: string): boolean {
  return Boolean(readMap()[postId]);
}

/** Map id -> liked hiện tại (chỉ đọc phía client) */
export function getLikedMap(): Record<string, boolean> {
  return readMap();
}

/** Bật/tắt like và trả về trạng thái mới */
export function setPostLiked(postId: string, liked: boolean): boolean {
  const map = readMap();
  if (Boolean(map[postId]) === liked) return liked;
  if (liked) {
    map[postId] = true;
  } else {
    delete map[postId];
  }
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(map));
  } catch {
    /* storage đầy — vẫn cập nhật UI + cookie */
  }
  writeCookie(map);
  notify();
  return liked;
}

export function togglePostLiked(postId: string): boolean {
  return setPostLiked(postId, !isPostLiked(postId));
}

export function subscribePostLikes(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function parseLikedIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}
