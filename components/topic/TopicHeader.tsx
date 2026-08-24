import type { Topic } from "@/data/notes";

export default function TopicHeader({ topic }: { topic: Topic }) {
  return (
    <header className="mb-4 px-5 sm:px-0">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-surface-quaternary text-2xl font-bold">
          {topic.emoji ?? "Đ"}
        </div>
        <h2 className="text-2xl font-bold sm:text-3xl">{topic.name}</h2>
      </div>
      {topic.description && (
        <p className="mt-2 text-sm text-text-secondary">{topic.description}</p>
      )}
    </header>
  );
}