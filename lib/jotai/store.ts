import { createStore } from "jotai";

/**
 * Store dùng chung cho toàn app. Export ra ngoài để code chạy
 * ngoài React (axios interceptor...) vẫn set/get được atom.
 */
export const appStore = createStore();
