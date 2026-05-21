"use client";

import { useEffect, useState, useCallback } from "react";

interface SectionNavProps {
  containerRef: React.RefObject<HTMLElement | null>;
  sectionIds: string[];
  labels: string[];
}

export default function SectionNav({ containerRef, sectionIds, labels }: SectionNavProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
      className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-50"
      aria-label="Navegación de secciones"
    >
      {/* Track line — subtle vertical guide */}
      <div
        className="absolute left-[5px] top-1 bottom-1 w-px bg-text-secondary/10 rounded-full"
        aria-hidden="true"
      />

      {/* Progress line — fills from top to active dot */}
      <div
        className="absolute left-[5px] top-[5px] w-px bg-sage/40 rounded-full transition-all duration-500 ease-out"
        style={{
          height: `${(activeIndex / Math.max(labels.length - 1, 1)) * 100}%`,
        }}
        aria-hidden="true"
      />

      <div className="flex flex-col items-center gap-4 sm:gap-5 relative">
        {labels.map((label, i) => {
          const isActive = i === activeIndex;
          const isHovered = i === hoveredIndex;

          return (
            <button
              key={sectionIds[i]}
              type="button"
              onClick={() => scrollTo(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(i)}
              onBlur={() => setHoveredIndex(null)}
              className="group relative flex items-center justify-center"
              aria-label={`Ir a ${label}`}
              aria-current={isActive ? "true" : undefined}
            >
              {/* Tooltip label — appears on hover/active */}
              <span
                className={`absolute right-full mr-3 whitespace-nowrap font-body text-xs font-medium tracking-wide px-2.5 py-1 rounded-md transition-all duration-200 pointer-events-none ${
                  isActive
                    ? "opacity-100 bg-sage/10 text-sage translate-x-0"
                    : isHovered
                      ? "opacity-100 bg-neutral-900/80 text-white translate-x-0"
                      : "opacity-0 translate-x-2"
                }`}
              >
                {label}
              </span>

              {/* Dot */}
              <span
                className={`block rounded-full transition-all duration-300 ease-out ${
                  isActive
                    ? "w-3 h-3 bg-sage shadow-[0_0_0_3px_rgba(129,130,99,0.2)]"
                    : isHovered
                      ? "w-2.5 h-2.5 bg-text-secondary/50"
                      : "w-2 h-2 bg-text-secondary/25 hover:bg-text-secondary/40"
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
