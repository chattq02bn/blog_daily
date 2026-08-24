import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import TopicHeader from "@/components/topic/TopicHeader";
import TopicCard from "@/components/topic/TopicCard";
import type { Note, TopicSection } from "@/data/notes";
import { lifestyleTopic, lifestyleSections } from "@/data/lifestyle";
import styles from "./topic.module.scss";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ s?: string }>;
};

const FAKE_AUTHORS = [
  "Bầu trời xanh",
  "Giọt sương sớm",
  "Người đi bộ",
  "Gọn gàng xinh",
  "Viện cà phê nhà",
  "Chiều thứ bảy",
];

function makeFakeNotes(sectionId: string, count = 4): Note[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = `${sectionId}-extra-${i + 1}`;
    return {
      id: seed,
      title: `Gợi ý nhỏ cho ngày bận rộn #${i + 1}: mẹo áp dụng được ngay từ hôm nay`,
      excerpt: `Chuyện nhỏ mà có võ từ chủ đề ${sectionId}. Chỉ vài phút mỗi ngày nhưng thay đổi rõ rệt sau một tuần.`,
      cover: `https://picsum.photos/seed/${seed}/1280/670`,
      author: FAKE_AUTHORS[i % FAKE_AUTHORS.length],
      avatar: `https://picsum.photos/seed/${seed}-avatar/96/96`,
      likes: 120 + ((i * 137) % 800),
      comments: 5 + ((i * 23) % 60),
      bookmark: 30 + ((i * 71) % 300),
      date: `2026-08-${String(20 - i).padStart(2, "0")}`,
      tags: ["đời sống", sectionId],
      body: [
        "Đây là bài viết mẫu cho màn chi tiết topic. Nội dung được sinh tự động để demo giao diện.",
        "Bạn có thể thay thế bằng dữ liệu thật từ API sau này.",
        "Mỗi bài viết đều có ảnh bìa, tác giả và số liệu tương tác riêng để card trông sống động hơn.",
      ],
    };
  });
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== lifestyleTopic.slug) {
    return { title: "Không tìm thấy chủ đề | note" };
  }
  const { s } = await searchParams;
  const section = lifestyleSections.find((sec) => sec.id === s);
  return { title: `${section ? section.title : lifestyleTopic.name} | note` };
}

export default async function TopicDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  if (slug !== lifestyleTopic.slug) notFound();

  const { s } = await searchParams;
  const activeSection =
    lifestyleSections.find((sec) => sec.id === s) || null;

  const sections: TopicSection[] = (
    activeSection ? [activeSection] : lifestyleSections
  ).map((section) => ({
    ...section,
    notes: [...section.notes, ...makeFakeNotes(section.id)],
  }));

  const totalNotes = sections.reduce((sum, sec) => sum + sec.notes.length, 0);

  return (
    <AppLayout>
      <div className={styles.page}>
        <TopicHeader topic={lifestyleTopic} />
        <p className={styles.count}>
          {totalNotes.toLocaleString("vi-VN")} bài viết · cập nhật hàng ngày
        </p>

        <div className={styles.backLinkWrap}>
          <Link href="/" className={styles.backLink}>
            ← Về trang chủ
          </Link>
        </div>

        {sections.map((section) => (
          <section key={section.id} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            {section.description && (
              <p className={styles.sectionDesc}>{section.description}</p>
            )}
            <div className={styles.grid}>
              {section.notes.map((note) => (
                <TopicCard
                  key={note.id}
                  note={note}
                  featured={!activeSection}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}
