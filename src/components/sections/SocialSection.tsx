"use client";

import type { SocialItem } from "@/lib/use-sanity-content";
import SocialCard from "@/components/social/SocialCard";
import SectionTitleOverlay from "@/components/ui/SectionTitleOverlay";

interface SocialSectionProps {
  id: string;
  social: SocialItem[];
}

export default function SocialSection({ id, social }: SocialSectionProps) {
  return (
    <section id={id} className="snap-start h-screen flex items-center justify-center relative overflow-hidden">
      {/* Solid background — full viewport height */}
      <div className="absolute inset-0 bg-sage" aria-hidden="true" />

      {/* Horizontal carousel with scroll-snap */}
      <div className="relative w-full h-full flex items-center overflow-x-auto snap-x snap-mandatory" style={{ zIndex: 50 }}>
        <div className="flex gap-8 px-[calc(50vw-200px)] sm:px-[calc(50vw-250px)] md:px-[calc(50vw-300px)]">
          {social.map((s, i) => (
            <div key={s.platform || i} className="snap-center shrink-0 w-[400px] sm:w-[500px] md:w-[600px]">
              <SocialCard social={s} index={i} />
            </div>
          ))}
        </div>
      </div>

      <SectionTitleOverlay
        title="REDES"
        textColor="#F5F2EB"
        effect="wiggle"
      />
    </section>
  );
}
