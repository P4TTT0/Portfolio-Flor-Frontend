"use client";

import { useEffect, useRef } from "react";
import type { SocialItem } from "@/lib/use-sanity-content";
import SocialCard from "@/components/social/SocialCard";
import SectionTitleOverlay from "@/components/ui/SectionTitleOverlay";

interface SocialSectionProps {
  id: string;
  social: SocialItem[];
}

export default function SocialSection({ id, social }: SocialSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const carousel = carouselRef.current;
    if (!section || !carousel) return;

    const isTouchCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchCoarse) return;

    const handleWheel = (e: WheelEvent) => {
      // Only intercept vertical scroll
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      // Check if section is fully in view
      const rect = section.getBoundingClientRect();
      const isInView = Math.abs(rect.top) < 50 && Math.abs(rect.bottom - window.innerHeight) < 50;

      if (!isInView) return;

      // Check if we can scroll horizontally
      const canScrollLeft = carousel.scrollLeft > 0;
      const canScrollRight = carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth - 1;

      // If we can't scroll in the direction of the wheel, don't intercept
      if (e.deltaY > 0 && !canScrollRight) return;
      if (e.deltaY < 0 && !canScrollLeft) return;

      // Multiply scroll speed for better UX
      const scrollAmount = e.deltaY * 3;

      // Intercept and move carousel
      e.preventDefault();
      e.stopPropagation();
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    section.addEventListener("wheel", handleWheel, { passive: false, capture: true });

    return () => {
      section.removeEventListener("wheel", handleWheel, { capture: true });
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      id={id} 
      className="snap-start h-dvh flex items-center justify-center relative overflow-hidden"
    >
      {/* Solid background — full viewport height */}
      <div className="absolute inset-0 bg-sage" aria-hidden="true" />

      {/* Horizontal carousel with scroll-snap */}
      <div 
        ref={carouselRef}
        className="relative w-full h-full flex items-center overflow-x-auto snap-x snap-mandatory" 
        style={{ zIndex: 50 }}
      >
        <div className="flex gap-8 px-4 sm:px-8 md:px-12 lg:px-[calc(50vw-200px)]">
          {social.map((s, i) => (
            <div key={s.platform || i} className="snap-center shrink-0 w-[85vw] sm:w-[500px] md:w-[600px]">
              <SocialCard social={s} index={i} />
            </div>
          ))}
        </div>
      </div>

      <SectionTitleOverlay
        imageSrc="/assets/animated/redes-sociales-title-animated.png"
      />
    </section>
  );
}
