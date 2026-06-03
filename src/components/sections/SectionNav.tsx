"use client";

import { useEffect, useState } from "react";

interface SectionNavProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

export default function SectionNav({ containerRef }: SectionNavProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateProgress = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    updateProgress();
    container.addEventListener("scroll", updateProgress, { passive: true });
    return () => container.removeEventListener("scroll", updateProgress);
  }, [containerRef]);

  return (
    <div
      className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-50 h-32 w-0.5 bg-black/10 rounded-full overflow-hidden"
      aria-label="Progreso de scroll"
      role="progressbar"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="w-full bg-black/60 rounded-full transition-all duration-150 ease-out"
        style={{ height: `${scrollProgress}%` }}
      />
    </div>
  );
}
