import AppLayout from "@/components/AppLayout";
import TopicHeader from "@/components/TopicHeader";
import TopicSectionView from "@/components/TopicSectionView";
import { lifestyleTopic, lifestyleSections } from "@/data/lifestyle";

export default function Home() {
  return (
    <AppLayout>
      <h1 className="sr-only">Chủ đề</h1>
      <div className="mx-auto min-h-screen pb-4 sm:px-4 sm:pb-6 lg:px-0">
        <TopicHeader topic={lifestyleTopic} />
        <div className="w-full">
          {lifestyleSections.map((section, index) => (
            <TopicSectionView
              key={section.id}
              section={section}
              variant={index === 0 ? "large" : "small"}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}