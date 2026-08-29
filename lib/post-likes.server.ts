import { cookies } from "next/headers";
import { LIKED_POSTS_COOKIE, parseLikedIds } from "./post-likes";

/**
 * Đọc danh sách bài viết user đã like từ cookie (ghi phía client khi thả tym).
 * Dùng cho Server Component để render đúng trạng thái tym ngay lần đầu —
 * không còn hiện tượng F5 xong mất tym rồi tym lại.
 */
export async function getInitialLikedIds(): Promise<string[]> {
  const store = await cookies();
  return parseLikedIds(store.get(LIKED_POSTS_COOKIE)?.value);
}
