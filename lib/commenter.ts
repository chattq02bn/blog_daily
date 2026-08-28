const COMMENTER_TOKEN_KEY = "note_commenter_token";
const COMMENTER_ID_KEY = "note_commenter_id";
const COMMENTER_NICKNAME_KEY = "note_commenter_nickname";

export function getCommenterToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(COMMENTER_TOKEN_KEY);
}

export function setCommenterToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMMENTER_TOKEN_KEY, token);
}

export function getCommenterId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(COMMENTER_ID_KEY);
  return raw ? Number(raw) : null;
}

export function setCommenterId(id: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMMENTER_ID_KEY, String(id));
}

export function getCommenterNickname(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(COMMENTER_NICKNAME_KEY);
}

export function setCommenterNickname(nickname: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMMENTER_NICKNAME_KEY, nickname);
}

export function clearCommenter(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COMMENTER_TOKEN_KEY);
  localStorage.removeItem(COMMENTER_ID_KEY);
  localStorage.removeItem(COMMENTER_NICKNAME_KEY);
}

export function hasCommenter(): boolean {
  return Boolean(getCommenterToken());
}
