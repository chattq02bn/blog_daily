import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import NoteActions from "@/components/note/NoteActions";
import NoteTitleActions from "@/components/note/NoteTitleActions";
import {
  ClientCommentList,
  ClientTopicCard,
} from "@/components/ClientComponents";
import SocialLinks from "@/components/note/SocialLinks";
import BackButton from "@/components/note/BackButton";
import { getNoteById, notes, Note } from "@/data/notes";
import { lifestyleNotes } from "@/data/lifestyle";
import styles from "./note.module.scss";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const note = getNoteById(id);
  if (!note) return { title: "Không tìm thấy bài viết | note" };
  return { title: `${note.title} | ${note.author} | note` };
}

function getRelatedNotes(
  currentNote: Note,
  allNotes: Note[],
  count = 2,
): Note[] {
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

export default async function NotePage({ params }: PageProps) {
  const { id } = await params;
  const note = getNoteById(id);
  if (!note) notFound();

  const allNotes = [...notes, ...lifestyleNotes];
  const relatedNotes = getRelatedNotes(note, allNotes);

  return (
    <AppLayout hideSidebar>
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
                />
              </figure>

              <header className={styles.header}>
                <h1 className={styles.title}>{note.title}</h1>

                <div className={styles.titleAttachment}>
                  <NoteTitleActions likes={note.likes} />
                </div>

                <div className={styles.creatorInfo}>
                  <Image
                    src={note.avatar}
                    alt={note.author}
                    width={32}
                    height={32}
                    className={styles.avatar}
                  />
                  <div className={styles.creatorInfoText}>
                    <div className={styles.creatorName}>{note.author}</div>
                    <time className={styles.creatorDate}>{note.date}</time>
                  </div>
                </div>
              </header>

              <div className={styles.body}>
                {note.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <div className={styles.hashtags}>
                {note.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag)}`}
                    className={styles.tag}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              <div className={styles.actionBar}>
                <NoteActions likes={note.likes} comments={note.comments} />
              </div>

              <div className={styles.commentSection}>
                <ClientCommentList noteId={note.id} />
              </div>

              {relatedNotes.length > 0 && (
                <div className={styles.recommendedSection}>
                  <h3 className={styles.recommendedTitle}>
                    Bài viết liên quan
                  </h3>
                  <div className={styles.recommendedGrid}>
                    {relatedNotes.map((related) => (
                      <ClientTopicCard
                        key={related.id}
                        note={related}
                        featured={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.rightRail} aria-hidden="true" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
