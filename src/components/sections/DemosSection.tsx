"use client";

import type { DemoItem } from "@/lib/use-sanity-content";
import DemoCard from "@/components/demos/DemoCard";

interface DemosSectionProps {
  id: string;
  demos: DemoItem[];
}

export default function DemosSection({ id, demos }: DemosSectionProps) {
  return (
    <section id={id} className="snap-start h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div
        className="w-full max-w-[min(85vw,1000px)] rounded-b-xl rounded-tr-xl shadow-[3px_8px_30px_rgba(0,0,0,0.12)] border border-[#C9AD86]/20 kraft-texture kraft-avocado flex flex-col"
        style={{ maxHeight: "calc(100vh - 3rem)" }}
      >
        <div className="p-4 sm:p-6 flex-1 flex flex-col min-h-0">
          <h2 className="font-heading text-xl sm:text-2xl text-text-primary/70 mb-4 tracking-tight shrink-0">
            Demos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 auto-rows-max content-start flex-1 overflow-hidden">
            {demos.map((demo) => (
              <DemoCard key={demo.title} demo={demo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
