"use client";

import type { DemoItem } from "@/lib/use-sanity-content";
import DemoCard from "@/components/demos/DemoCard";

interface DemosSectionProps {
  id: string;
  demos: DemoItem[];
}

export default function DemosSection({ id, demos }: DemosSectionProps) {
  return (
    <section id={id} className="snap-start h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Top rope */}
      <img
        src="/assets/elements/rope.png"
        alt=""
        className="absolute top-8 sm:top-12 left-0 w-full h-auto pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Bottom rope — mirrored */}
      <img
        src="/assets/elements/rope.png"
        alt=""
        className="absolute bottom-8 sm:bottom-12 left-0 w-full h-auto pointer-events-none z-10"
        style={{ transform: "scaleX(-1) scaleY(-1)" }}
        aria-hidden="true"
      />

      {/* Demo cards hanging between ropes */}
      <div className="relative z-20 flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10 px-4 sm:px-8 max-w-[min(90vw,1100px)]">
        {demos.map((demo) => (
          <DemoCard key={demo.title} demo={demo} />
        ))}
      </div>
    </section>
  );
}
