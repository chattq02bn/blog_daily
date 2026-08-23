import AppLayout from "@/components/layout/AppLayout";
import TopicHeader from "@/components/topic/TopicHeader";
import TopicSectionView from "@/components/topic/TopicSectionView";
import { lifestyleTopic, lifestyleSections } from "@/data/lifestyle";

export default function Home() {
  return (
    <AppLayout>
      <h1 className="sr-only">Chủ đề</h1>
      <div className="mx-auto min-h-screen pb-4 sm:px-4 sm:pb-6 lg:px-0">
        <TopicHeader topic={lifestyleTopic} className="px-5 pt-1 lg:px-0" />
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