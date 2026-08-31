import { cookies } from "next/headers";
import { LIKED_COMMENTS_COOKIE, parseLikedCommentIds } from "./comment-likes";

export async function getInitialLikedCommentIds(): Promise<string[]> {
  const store = await cookies();
  return parseLikedCommentIds(store.get(LIKED_COMMENTS_COOKIE)?.value);
}
