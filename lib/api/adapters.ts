import type { ApiComment, ApiPost, ApiSection } from "@/lib/api";
import type { Note, TopicSection } from "@/lib/view-models";
import type { Comment, CommentEmoji } from "@/lib/commentStorage";

const EMOJIS: CommentEmoji[] = ["👍", "❤️", "😂", "😮", "😢", "😡", "👏", "🙏"];

/** Chuyển bodyBlocks (JSON từ BE) thành các đoạn văn thuần để xem trước */
function blocksToParagraphs(blocks: unknown[]): string[] {
  const paragraphs: string[] = [];

  for (const block of blocks) {
    if (
      block &&
      typeof block === "object" &&
      "type" in block &&
      (block as { type?: unknown }).type === "paragraph"
    ) {
      const content = (block as { content?: unknown }).content;
      if (typeof content === "string" && content.trim()) {
        paragraphs.push(content);
      }
    }
  }

  return paragraphs;
}

export function postToNote(post: ApiPost): Note {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt ?? "",
    cover:
      post.cover ?? "",
    author: post.authorName,
    avatar:
      post.authorAvatar ?? "",
    authorDescription: post.authorDescription ?? null,
    likes: post.likes,
    comments: post.commentsCount,
    bookmark: post.bookmarks,
    date: post.date,
    tags: post.tags.map((tag) => tag.name),
    body: blocksToParagraphs(post.bodyBlocks),
    blocks: post.bodyBlocks as Note["blocks"],
  };
}

export function sectionToTopicSection(
  section: ApiSection,
  topicHref: string
): TopicSection {
  return {
    id: section.id,
    title: section.title,
    description: section.description ?? "",
    href: topicHref,
    notes: section.posts.map(postToNote),
  };
}

const EMPTY_EMOJIS = Object.fromEntries(
  EMOJIS.map((emoji) => [emoji, 0])
) as Record<CommentEmoji, number>;

const EMPTY_REACTIONS = Object.fromEntries(
  EMOJIS.map((emoji) => [emoji, false])
) as Record<CommentEmoji, boolean>;

export function apiCommentToComment(apiComment: ApiComment): Comment {
  const emojis: Record<CommentEmoji, number> = { ...EMPTY_EMOJIS };
  for (const reaction of apiComment.reactions) {
    if ((EMOJIS as string[]).includes(reaction.emoji)) {
      emojis[reaction.emoji as CommentEmoji] = reaction.count;
    }
  }

  const userReactions: Record<CommentEmoji, boolean> = { ...EMPTY_REACTIONS };
  for (const emoji of apiComment.myReactions) {
    if ((EMOJIS as string[]).includes(emoji)) {
      userReactions[emoji as CommentEmoji] = true;
    }
  }

  return {
    id: apiComment.id,
    noteId: apiComment.noteId,
    parentId: apiComment.parentId,
    commenterId: apiComment.commenterId,
    author: apiComment.author,
    authorAvatar: apiComment.authorAvatar ?? "",
    isAuthor: apiComment.isAuthor ?? false,
    parentAuthor: apiComment.parentAuthor,
    content: apiComment.content,
    emojis,
    userReactions,
    createdAt: apiComment.createdAt,
    updatedAt: apiComment.updatedAt,
    isEdited: apiComment.isEdited,
    repliesCount: apiComment.repliesCount ?? 0,
  };
}
