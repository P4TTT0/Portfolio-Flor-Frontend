import SectionTitleOverlay from "@/components/ui/SectionTitleOverlay";
import WorkSlide from "@/components/works/WorkSlide";
import type { WorkItem } from "@/lib/use-sanity-content";

interface WorksSectionProps {
  id: string;
  works: WorkItem[];
}

const ROTATIONS = [-10, 7, -14];
const FLOAT_DURATIONS = [3.8, 4.6, 4.1];

export default function WorksSection({ id, works }: WorksSectionProps) {
  const visibleWorks = works.slice(0, 3);

  if (works.length === 0) {
    return (
      <section
        id={id}
        className="snap-start h-dvh flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-oat" aria-hidden="true" />
        <p className="relative z-10 font-heading text-2xl sm:text-3xl md:text-4xl text-text-secondary/40 tracking-widest uppercase">
          Próximamente
        </p>
        <SectionTitleOverlay imageSrc="/assets/animated/trabajos-title.png" />
      </section>
    );
  }

  return (
    <>
      {visibleWorks.map((work, i) => (
        <WorkSlide
          key={work.youtubeUrl + i}
          sectionId={i === 0 ? id : undefined}
          work={work}
          rotation={ROTATIONS[i % ROTATIONS.length]}
          floatDuration={FLOAT_DURATIONS[i % FLOAT_DURATIONS.length]}
          reverse={i % 2 !== 0}
          showTitle={i === 0}
          isLast={i === visibleWorks.length - 1}
          allWorks={works}
        />
      ))}
    </>
  );
}
