"use client";

import { useRef } from "react";
import SectionTitleOverlay from "@/components/ui/SectionTitleOverlay";
import WorkSlide from "@/components/works/WorkSlide";
import type { WorkItem } from "@/lib/content";

interface WorksSectionProps {
  id: string;
  works: WorkItem[];
}

const ROTATIONS = [-10, 7, -14];
const FLOAT_DURATIONS = [3.8, 4.6, 4.1];

export default function WorksSection({ id, works }: WorksSectionProps) {
  // The three work slides are separate snap sections but read as one screen,
  // so the title overlay tracks the whole group instead of the first slide.
  const groupRef = useRef<HTMLDivElement>(null);
  const visibleWorks = works.slice(0, 3);

  if (works.length === 0) {
    return (
      <section
        id={id}
        className="snap-start h-dvh flex items-center justify-center relative overflow-hidden"
      >
        <h2 className="sr-only">Trabajos</h2>
        <div className="absolute inset-0 bg-oat" aria-hidden="true" />
        <p className="relative z-10 font-heading text-2xl sm:text-3xl md:text-4xl text-text-secondary/40 tracking-widest uppercase">
          Próximamente
        </p>
        <SectionTitleOverlay imageSrc="/assets/animated/trabajos-title.png" />
      </section>
    );
  }

  return (
    // Single-cell grid so the title layer and the slides overlap without the
    // title consuming layout space. A negative margin would do the same, but it
    // also shifts the sticky constraint rectangle, which would keep the title
    // pinned past the end of the group.
    <div ref={groupRef} className="grid grid-cols-1">
      <h2 className="sr-only">Trabajos</h2>
      {/*
        Viewport-sized sticky title layer. It scrolls in with the first slide,
        pins while the group owns the screen, and is pushed out by the last one,
        so the title reads as part of the content instead of glued to the
        viewport. Its own height is what decides where it unpins — `h-0` would
        keep it stuck all the way past the group.
      */}
      <div
        className="col-start-1 row-start-1 sticky top-0 h-dvh z-[100] pointer-events-none"
        aria-hidden="true"
      >
        <SectionTitleOverlay
          imageSrc="/assets/animated/trabajos-title.png"
          targetRef={groupRef}
        />
      </div>

      <div className="col-start-1 row-start-1">
        {visibleWorks.map((work, i) => (
          <WorkSlide
            key={work.youtubeUrl + i}
            sectionId={i === 0 ? id : undefined}
            work={work}
            rotation={ROTATIONS[i % ROTATIONS.length]}
            floatDuration={FLOAT_DURATIONS[i % FLOAT_DURATIONS.length]}
            reverse={i % 2 !== 0}
            isLast={i === visibleWorks.length - 1}
            allWorks={works}
          />
        ))}
      </div>
    </div>
  );
}
