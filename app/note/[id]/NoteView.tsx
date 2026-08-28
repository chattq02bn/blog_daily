"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import NoteActions from "@/components/note/NoteActions";
import NoteTitleActions from "@/components/note/NoteTitleActions";
import {
  ClientCommentList,
  ClientTopicCard,
  ClientNoteBody,
} from "@/components/ClientComponents";
import SocialLinks from "@/components/note/SocialLinks";
import BackButton from "@/components/note/BackButton";
import type { Note } from "@/lib/view-models";
import { usePost, usePosts } from "@/hooks/use-api";
import { postToNote } from "@/lib/api/adapters";
import styles from "./note.module.scss";

function getRelatedNotes(currentNote: Note, allNotes: Note[], count = 36): Note[] {
  return allNotes
    .filter((n) => n.id !== currentNote.id)
    .map((n) => ({
      note: n,
      score: n.tags.filter((tag) => currentNote.tags.includes(tag)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((item) => item.note);
}

export default function NoteView({ id }: { id: string }) {
  const { data: post, isError } = usePost(id);
  const { data: recentPosts } = usePosts({ status: "published", limit: 200 });

  if (isError) notFound();

  if (!post) {
    return (
      <div className={styles.article}>
        <div className={`${styles.articleInner} ${styles.skeleton ?? ""} animate-pulse`}>
          <div className="mx-auto mt-10 h-[420px] w-full max-w-3xl rounded-2xl bg-surface-quaternary" />
        </div>
      </div>
    );
  }

  const note = postToNote(post);
  const relatedNotes = recentPosts
    ? getRelatedNotes(note, recentPosts.data.map(postToNote))
    : [];

  return (
    <div className={styles.article}>
      <div className={styles.articleInner}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.creatorProfile}>
              <Image
                src={note.avatar}
                alt={note.author}
                width={80}
                height={80}
                className={styles.profileAvatar}
                unoptimized
              />
              <div className={styles.profileBody}>
                <div className={styles.profileName}>{note.author}</div>
                <div className={styles.profileDescription}>
                  {note.excerpt || note.body?.[0]}
                </div>
                <SocialLinks />
              </div>
            </div>
            <BackButton />
          </aside>

          <div className={styles.content}>
            <figure className={styles.eyecatch}>
              <Image
                src={note.cover}
                alt={note.title}
                fill
                sizes="(max-width: 900px) 100vw, 700px"
                priority
                style={{ borderRadius: 8 }}
                unoptimized
              />
            </figure>

            <header className={styles.header}>
              <h1 className={styles.title}>{note.title}</h1>

              <div className={styles.titleAttachment}>
                <NoteTitleActions postId={note.id} likes={note.likes} />
              </div>

              <div className={styles.creatorInfo}>
                <Image
                  src={note.avatar}
                  alt={note.author}
                  width={32}
                  height={32}
                  className={styles.avatar}
                  unoptimized
                />
                <div className={styles.creatorInfoText}>
                  <div className={styles.creatorName}>{note.author}</div>
                  <time className={styles.creatorDate}>{note.date}</time>
                </div>
              </div>
            </header>

            <div className={styles.body}>
              <ClientNoteBody blocks={note.blocks?.length ? note.blocks : note.body.map((paragraph) => ({ type: "paragraph", content: paragraph }))} />
            </div>

            <div className={styles.hashtags}>
              {note.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>

            <div className={styles.actionBar}>
              <NoteActions postId={note.id} likes={note.likes} comments={note.comments} />
            </div>

            <div className={styles.commentSection}>
              <ClientCommentList noteId={note.id} />
            </div>

            {relatedNotes.length > 0 && (
              <div className={styles.recommendedSection}>
                <h3 className={styles.recommendedTitle}>Bài viết liên quan</h3>
                <div className={styles.recommendedGrid}>
                  {relatedNotes.map((related) => (
                    <ClientTopicCard key={related.id} note={related} featured={true} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.rightRail} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
