import { adminTopics, adminTags, type AdminTopic, type AdminTag } from "@/data/admin";
import { topics } from "@/data/notes";
import type { Block } from "@blocknote/core";

export interface SidebarItem {
  id: string;
  name: string;
  href: string;
  postCount: number;
  topicIds: string[];
  children?: SidebarItem[];
}

export interface AdminPost {
  id: string;
  title: string;
  topicIds: string[];
  tagIds: string[];
  bodyBlocks?: Block[];
}

export const seedPosts: AdminPost[] = [
  { id: "p1", title: "\u201CViết\u201D là cách tôi lớn lên từ từ", topicIds: ["t1", "t5"], tagIds: ["tag1", "tag2"] },
  { id: "p2", title: "Cách chọn đồ ăn vặt văn phòng cho người mới", topicIds: ["t7", "t2"], tagIds: ["tag3", "tag5"] },
  { id: "p3", title: "Năm thứ 2 dậy sớm — mật độ của thời gian", topicIds: ["t5", "t6"], tagIds: ["tag1", "tag6"] },
  { id: "p4", title: "Công thức cà phê latte nghệ thuật tại nhà", topicIds: ["t2", "t4"], tagIds: ["tag4"] },
  { id: "p5", title: "Mẹo sống xanh: tái chế đồ cũ trong nhà", topicIds: ["t1"], tagIds: ["tag3", "tag7"] },
  { id: "p6", title: "Ăn vặt không tăng cân — 5 gợi ý cho dân văn phòng", topicIds: ["t7", "t4"], tagIds: ["tag3", "tag8"] },
  { id: "p7", title: "Sống một mình: 10 món đồ nên mua ngay từ đầu", topicIds: ["t6", "t1"], tagIds: ["tag5", "tag6"] },
  { id: "p8", title: "Chuyện nhà tôi: cách cả nhà cùng nấu ăn cuối tuần", topicIds: ["t3", "t4"], tagIds: ["tag1", "tag4"] },
];

export const seedSidebarItems: SidebarItem[] = [
  { id: "s1", name: "Trang chủ", href: "/", postCount: 120, topicIds: ["t1", "t5"] },
  { id: "s2", name: "Xu hướng", href: "/trend", postCount: 45, topicIds: ["t2"] },
  { id: "s3", name: "Trang cá nhân", href: "/mypage", postCount: 18, topicIds: [] },
  { id: "s4", name: "Tạp chí", href: "/magazines", postCount: 26, topicIds: ["t3", "t4"] },
  { id: "s5", name: "Vòng tròn", href: "/salons", postCount: 9, topicIds: [] },
  ...topics.map((topic, i) => ({
    id: `s${i + 6}`,
    name: topic.title,
    href: topic.href,
    postCount: 0,
    topicIds: [
      adminTopics[(i + 1) % adminTopics.length].id,
      adminTopics[(i + 3) % adminTopics.length].id,
    ],
    children: topic.children.map((child, j) => ({
      id: `s${i + 6}-${j + 1}`,
      name: child,
      href: `/tag/${encodeURIComponent(child)}`,
      postCount: ((i * 5 + j * 7) % 20) + 3,
      topicIds: [adminTopics[j % adminTopics.length].id],
    })),
  })),
];

const TOPICS_KEY = "note_admin_topics";
const SIDEBAR_ITEMS_KEY = "note_admin_sidebar_items";
const TAGS_KEY = "note_admin_tags";
const POSTS_KEY = "note_admin_posts";

export function loadTopics(): AdminTopic[] {
  if (typeof window === "undefined") return adminTopics;
  try {
    const raw = localStorage.getItem(TOPICS_KEY);
    if (!raw) return adminTopics;
    const stored = JSON.parse(raw) as AdminTopic[];
    return [
      ...adminTopics,
      ...stored
        .filter((t) => !adminTopics.some((a) => a.id === t.id))
        .map((t) => ({ ...t, description: t.description ?? "" })),
    ];
  } catch {
    return adminTopics;
  }
}

export function saveTopic(topic: AdminTopic): void {
  try {
    const raw = localStorage.getItem(TOPICS_KEY);
    const stored: AdminTopic[] = raw ? JSON.parse(raw) : [];
    const index = stored.findIndex((t) => t.id === topic.id);
    if (index >= 0) {
      stored[index] = topic;
    } else {
      stored.push(topic);
    }
    localStorage.setItem(TOPICS_KEY, JSON.stringify(stored));
  } catch {
    // ignore
  }
}

export function deleteTopic(id: string): void {
  try {
    const raw = localStorage.getItem(TOPICS_KEY);
    const stored: AdminTopic[] = raw ? JSON.parse(raw) : [];
    const next = stored.filter((t) => t.id !== id);
    localStorage.setItem(TOPICS_KEY, JSON.stringify(next));

    const items = loadSidebarItems();
    const changed = items.some((it) =>
      it.topicIds.includes(id) || it.children?.some((c) => c.topicIds.includes(id))
    );
    if (changed) {
      saveSidebarItems(
        items.map((it) => ({
          ...it,
          topicIds: it.topicIds.filter((tid) => tid !== id),
          children: it.children?.map((c) => ({
            ...c,
            topicIds: c.topicIds.filter((tid) => tid !== id),
          })),
        }))
      );
    }
  } catch {
    // ignore
  }
}

export function loadSidebarItems(): SidebarItem[] {
  if (typeof window === "undefined") return seedSidebarItems;
  try {
    const raw = localStorage.getItem(SIDEBAR_ITEMS_KEY);
    if (!raw) return seedSidebarItems;
    return JSON.parse(raw) as SidebarItem[];
  } catch {
    return seedSidebarItems;
  }
}

export function saveSidebarItems(items: SidebarItem[]): void {
  try {
    localStorage.setItem(SIDEBAR_ITEMS_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function loadTags(): AdminTag[] {
  if (typeof window === "undefined") return adminTags;
  try {
    const raw = localStorage.getItem(TAGS_KEY);
    if (!raw) return adminTags;
    const stored = JSON.parse(raw) as AdminTag[];
    return [
      ...adminTags,
      ...stored.filter((t) => !adminTags.some((a) => a.id === t.id)),
    ];
  } catch {
    return adminTags;
  }
}

export function saveTags(tags: AdminTag[]): void {
  try {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  } catch {
    // ignore
  }
}

export function loadPosts(): AdminPost[] {
  if (typeof window === "undefined") return seedPosts;
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) return seedPosts;
    return JSON.parse(raw) as AdminPost[];
  } catch {
    return seedPosts;
  }
}

export function savePosts(posts: AdminPost[]): void {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch {
    // ignore
  }
}