import { atom } from "jotai";
import { appStore } from "./store";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

/** Modal đăng nhập thay cho trang /admin/auth (đã xóa) */
export const loginModalAtom = atom(false);

/** Thông báo hiển thị trong modal (vd: phiên hết hạn) */
export const loginModalNoticeAtom = atom<string | null>(null);

/** User hiện tại, đồng bộ từ lib/auth khi save/clear */
export const authUserAtom = atom<AuthUser | null>(null);

export const isAuthedAtom = atom((get) => get(authUserAtom) !== null);

export function openLoginModal(notice?: string): void {
  appStore.set(loginModalNoticeAtom, notice ?? null);
  appStore.set(loginModalAtom, true);
}

export function closeLoginModal(): void {
  appStore.set(loginModalAtom, false);
  appStore.set(loginModalNoticeAtom, null);
}
