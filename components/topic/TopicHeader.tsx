import Link from "next/link";

export default function TopicHeader({
  topic,
  href,
  className = "",
}: {
  topic: {
    name: string;
    emoji?: string;
    description?: string;
  };
  href?: string;
  className?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-surface-quaternary text-2xl font-bold">
          {topic.emoji ?? topic.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold sm:text-3xl">{topic.name}</h2>
      </div>
      {topic.description && (
        <p className="mt-2 text-sm text-text-secondary">{topic.description}</p>
      )}
    </>
  );

  return (
    <header className={`mb-4 px-0 ${className}`.trim()}>
      {href ? (
        <Link href={href} className="block hover:opacity-80 transition-opacity">
          {content}
        </Link>
      ) : (
        content
      )}
    </header>
  );
}
