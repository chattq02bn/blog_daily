/**
 * View model dùng cho UI (card, section...) — được chuyển đổi từ API response
 * qua các adapter trong lib/api/adapters.ts
 */
export type NoteBlock = {
  type: string;
  props?: Record<string, unknown>;
  content?: unknown;
};

export type Note = {
  id: string;
  title: string;
  excerpt: string;
  cover: string;
  author: string;
  avatar: string;
  authorDescription: string | null;
  likes: number;
  comments: number;
  bookmark: number;
  date: string;
  tags: string[];
  body: string[];
  /** Nội dung dạng khối cho editor xem-chi-tiết; nếu bỏ trống sẽ suy ra từ body */
  blocks?: NoteBlock[];
};

export type Topic = {
  slug?: string;
  name: string;
  emoji?: string;
  description?: string;
};

export type TopicSection = {
  id: string;
  title: string;
  description: string;
  href: string;
  notes: Note[];
};
