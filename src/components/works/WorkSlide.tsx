"use client";

import { useEffect, useRef, useState } from "react";
import SectionTitleOverlay from "@/components/ui/SectionTitleOverlay";
import WorkPolaroidItem from "@/components/works/WorkPolaroidItem";
import WorksGalleryModal from "@/components/works/WorksGalleryModal";
import type { WorkItem } from "@/lib/use-sanity-content";

// How far the content exits in the opposite direction of entry (px)
const EXIT_RANGE = 0.75; // fraction of viewport height at which exit is complete

interface WorkSlideProps {
  sectionId?: string;
  work: WorkItem;
  rotation: number;
  floatDuration?: number;
  reverse?: boolean;
  showTitle?: boolean;
  isLast: boolean;
  allWorks: WorkItem[];
}

export default function WorkSlide({
  sectionId,
  work,
  rotation,
  floatDuration,
  reverse = false,
  showTitle,
  isLast,
  allWorks,
}: WorkSlideProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const main = section.closest("main") as HTMLElement | null;
    if (!main) return;

    // Entry side: ltr comes from left (-80px), rtl from right (+80px)
    const xEntry = reverse ? 80 : -80;
    // Exit side: opposite of entry so the polaroid "flies off" visibly
    const xExit = reverse ? -40 : 40;

    // No CSS transition — we drive this manually
    content.style.willChange = "transform, opacity";
    content.style.transition = "none";

    // Measure once — sections are static (all h-dvh, no reflow expected).
    // Using main.scrollTop instead of getBoundingClientRect() in the scroll
    // hot path avoids forced synchronous layout on every frame.
    const mainRect = main.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const sectionOffset = sectionRect.top - mainRect.top + main.scrollTop;
    const vh = window.innerHeight;

    let rafId: number;

    function update() {
      if (!content || !main) return;

      // progress = 0 when centered, <0 when below viewport, >0 when above
      const progress = -(sectionOffset - main.scrollTop) / vh;

      let x: number;
      let op: number;

      if (progress <= -1) {
        // Fully below viewport — entry start state (hidden)
        x = xEntry;
        op = 0;
      } else if (progress < 0) {
        // Entering from below: progress -1 → 0 maps to animation 0% → 100%
        const t = progress + 1; // 0..1
        x = xEntry * (1 - t);
        op = t;
      } else if (progress < EXIT_RANGE) {
        // Exiting above: progress 0 → EXIT_RANGE maps to animation 0% → 100%
        const t = progress / EXIT_RANGE;
        x = xExit * t;
        op = 1 - t;
      } else {
        // Fully above viewport — exit end state (hidden)
        x = xExit;
        op = 0;
      }

      content.style.transform = `translateX(${x.toFixed(1)}px)`;
      content.style.opacity = String(Math.max(0, Math.min(1, op)));
    }

    function onScroll() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    }

    main.addEventListener("scroll", onScroll, { passive: true });
    update(); // position on mount

    return () => {
      main.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [reverse]);

  return (
    <>
      <section
        ref={sectionRef}
        id={sectionId}
        className="snap-start h-dvh flex items-center justify-center relative overflow-hidden px-4 sm:px-10 lg:px-16"
      >
        <div className="absolute inset-0 bg-oat" aria-hidden="true" />

        <div ref={contentRef} className="relative z-10 w-full max-w-5xl mx-auto flex justify-center">
          <WorkPolaroidItem
            work={work}
            rotation={rotation}
            floatDuration={floatDuration}
            reverse={reverse}
          />
        </div>

        {isLast && (
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 font-body text-xs tracking-widest text-text-secondary border-b border-text-secondary/40 pb-px hover:text-text-primary hover:border-text-primary/60 transition-colors uppercase"
          >
            Ver todos los trabajos
          </button>
        )}

        {showTitle && (
          <SectionTitleOverlay imageSrc="/assets/animated/trabajos-title.png" />
        )}
      </section>

      {galleryOpen && (
        <WorksGalleryModal works={allWorks} onClose={() => setGalleryOpen(false)} />
      )}
    </>
  );
}
