"use client";

import { useEffect, useState, useCallback } from "react";

interface SectionNavProps {
  containerRef: React.RefObject<HTMLElement | null>;
  sectionIds: string[];
  labels: string[];
}

export default function SectionNav({ containerRef, sectionIds, labels }: SectionNavProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = sectionIds.indexOf(entry.target.id);
            if (idx !== -1) setActiveIndex(idx);
          }
        }
      },
      { threshold: 0.5, root: container }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [containerRef, sectionIds]);

  const scrollTo = useCallback(
    (index: number) => {
      const section = document.getElementById(sectionIds[index]);
      section?.scrollIntoView({ behavior: "smooth" });
    },
    [sectionIds]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        scrollTo(index);
      }
    },
    [scrollTo]
  );

  return (
    <nav
      className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
      aria-label="Navegación de secciones"
    >
      {labels.map((label, i) => (
        <button
          key={sectionIds[i]}
          type="button"
          onClick={() => scrollTo(i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="group flex items-center gap-2.5"
          aria-label={`Ir a ${label}`}
          aria-current={i === activeIndex ? "true" : undefined}
        >
          <span className="font-body text-xs text-text-secondary/60 group-hover:text-text-secondary/90 transition-colors hidden sm:inline leading-none">
            {label}
          </span>
          <span
            className={`block w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "bg-sage scale-125 shadow-md"
                : "bg-text-secondary/25 hover:bg-text-secondary/40"
            }`}
          />
        </button>
      ))}
    </nav>
  );
}
