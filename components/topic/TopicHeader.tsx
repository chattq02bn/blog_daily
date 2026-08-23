import type { Topic } from "@/data/notes";

export default function TopicHeader({
  topic,
  className = "",
}: {
  topic: Topic;
  className?: string;
}) {
  return (
    <header className={`mb-4 px-0 ${className}`.trim()}>
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