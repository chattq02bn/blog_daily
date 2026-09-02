import type { ApiSidebarItem } from "@/lib/api";

/* Số mục gốc mỗi lần kéo xuống load thêm (BE phân trang /sidebar?page&limit) */
export const HOME_SIDEBAR_PAGE_LIMIT = 3;
/* Số chủ đề hiển thị mỗi lần cuộn xuống load thêm */
export const HOME_TOPICS_PER_SCROLL = 2;
/* Sidebar nav: số mục cha nạp lần đầu / mỗi lần cuộn sát đáy */
export const SIDEBAR_NAV_PAGE_SIZE = 15;
/* Số mục con nhúng kèm mỗi mục cha / mỗi lần bấm xem thêm */
export const SIDEBAR_CHILDREN_LIMIT = 5;
/* Số bài mặc định của mỗi topic (ô thứ 15 là "Xem tất cả") */
export const HOME_POSTS_PER_SECTION = 14;

/**
 * Mục cha có gắn topic hoặc có con gắn topic được đưa lên cùng cấp,
 * giữ đúng thứ tự xuất hiện trong sidebar.
 * @param limit Số lượng topic tối đa trả về (0 = không giới hạn)
 */
export function flattenTopics(items: ApiSidebarItem[], limit = 0): ApiSidebarItem[] {
  const result: ApiSidebarItem[] = [];
  for (const item of items) {
    if (limit > 0 && result.length >= limit) break;
    const hasDirectTopics = item.topicIds.length > 0;
    const hasChildTopics = item.children.some((c) => c.topicIds.length > 0);
    if (hasDirectTopics || hasChildTopics) result.push(item);
    for (const child of item.children) {
      if (limit > 0 && result.length >= limit) break;
      if (child.topicIds.length > 0) result.push(child);
    }
  }
  return result;
}

/** Params truy vấn bài viết của một mục sidebar (dùng cho usePosts + prefetch) */
export function sectionPostsParams(item: ApiSidebarItem) {
  const topicIds = item.topicIds.length > 0
    ? item.topicIds
    : item.children.flatMap((c) => c.topicIds);
  return {
    topicIds,
    status: "published" as const,
    limit: HOME_POSTS_PER_SECTION,
  };
}
