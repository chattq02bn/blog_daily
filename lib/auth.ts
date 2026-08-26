import type { ApiAuthSession } from "@/lib/api";
import { appStore } from "@/lib/jotai/store";
import { authUserAtom } from "@/lib/jotai/auth";

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
}

const USER_KEY = "note_user";
export const ACCESS_TOKEN_KEY = "note_access_token";
const REFRESH_TOKEN_KEY = "note_refresh_token";

export const AUTH_COOKIE_NAME = "note_access_token";

export function hasAuth(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
}

export function getStoredUser(): AuthSession["user"] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession["user"];
  } catch {
    return null;
  }
}

export function saveAuth(session: AuthSession): void {
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  document.cookie = `${AUTH_COOKIE_NAME}=${session.accessToken}; path=/; max-age=${7 * 24 * 3600}`;
  appStore.set(authUserAtom, session.user);
}

/** Lưu session nhận về từ API đăng nhập/đăng ký */
export function saveApiSession(session: ApiAuthSession): void {
  saveAuth({
    user: {
      id: String(session.user.id),
      name: session.user.name ?? session.user.email.split("@")[0],
      email: session.user.email,
    },
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  });
}

export function clearAuth(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
  appStore.set(authUserAtom, null);
}
