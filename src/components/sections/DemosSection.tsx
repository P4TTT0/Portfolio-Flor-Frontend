"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { DemoItem } from "@/lib/use-sanity-content";
import DemoCard from "@/components/demos/DemoCard";
import SectionTitleOverlay from "@/components/ui/SectionTitleOverlay";
import useBreakpoint, { type Breakpoint } from "@/hooks/useBreakpoint";

interface DemosSectionProps {
  id: string;
  demos: DemoItem[];
}

const DESIGN_WIDTH = 1200;
const DESIGN_HEIGHT = 800;

const BREAKPOINT_SCALES: Record<Breakpoint, number> = {
  mobile: 1.0,
  tablet: 1.2,
  desktop: 1.2,
};

const GRID_CONFIG: Record<
  Breakpoint,
  { cols: number; gap: number; padding: string }
> = {
  mobile: { cols: 2, gap: 12, padding: "10px 316px 0px 316px" },
  tablet: { cols: 4, gap: 16, padding: "108px 128px 112px" },
  desktop: { cols: 4, gap: 20, padding: "108px 128px 112px" },
};

const PAPER_STAR_CONFIG: Record<Breakpoint, { top: number; right: number; width: number }> = {
  mobile: { top: 14, right: 15, width: 165 },
  tablet: { top: 10, right: 16, width: 159 },
  desktop: { top: 10, right: 16, width: 159 },
};

export default function DemosSection({ id, demos }: DemosSectionProps) {
  const { breakpoint, isMobile } = useBreakpoint();
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scale computation via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el?.parentElement) return;

    const computeScale = () => {
      const parent = el.parentElement!;
      const maxScale = BREAKPOINT_SCALES[breakpoint];

      let scaleFactor: number;
      if (breakpoint === "mobile") {
        // Mobile: pizarra rotates 90°, effective width = DESIGN_HEIGHT, effective height = DESIGN_WIDTH
        scaleFactor = Math.min(
          parent.clientWidth / DESIGN_HEIGHT,
          parent.clientHeight / DESIGN_WIDTH,
          maxScale,
        );
      } else {
        scaleFactor = Math.min(
          parent.clientWidth / DESIGN_WIDTH,
          parent.clientHeight / DESIGN_HEIGHT,
          maxScale,
        );
      }

      // Avoid flicker: only update if change is meaningful (> 0.001)
      setScale((prev) =>
        Math.abs(prev - scaleFactor) > 0.001 ? scaleFactor : prev,
      );
    };

    computeScale();
    const ro = new ResizeObserver(computeScale);
    ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [breakpoint]);

  const gridConfig = GRID_CONFIG[breakpoint];
  const paperStar = PAPER_STAR_CONFIG[breakpoint];

  return (
    <section
      id={id}
      className="snap-start h-dvh relative overflow-hidden"
    >
      {/* Solid background — full viewport height */}
      <div className="absolute inset-0 bg-avocado" aria-hidden="true" />

      {/* Scale container wrapper — fills the section */}
      <div className="absolute inset-0">
        {/* Pizarra container — 1200×800, the actual container for cards */}
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            marginLeft: -DESIGN_WIDTH / 2,
            marginTop: -DESIGN_HEIGHT / 2,
            transform: isMobile
              ? `rotate(90deg) scale(${scale})`
              : `scale(${scale})`,
            transformOrigin: "center center",
            zIndex: 50,
          }}
        >
          {/* Pizarra background image — absolute, just visual */}
          <Image
            src="/assets/elements/pizarra.png"
            alt="Pizarra de demos"
            width={DESIGN_WIDTH}
            height={DESIGN_HEIGHT}
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: "contain" }}
            priority
          />

          {/* Paper star decoration — absolute within pizarra container */}
          <img
            src="/assets/elements/paper-star.png"
            alt=""
            className="absolute pointer-events-none"
            style={{
              top: paperStar.top,
              right: paperStar.right,
              width: paperStar.width,
              height: "auto",
              zIndex: 20,
            }}
            aria-hidden="true"
          />

          {/* Cards grid — lives inside pizarra with padding */}
          <div
            className="relative w-full h-full grid items-start content-start"
            style={{
              padding: gridConfig.padding,
              gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
              gap: gridConfig.gap,
              // Counter-rotate on mobile so cards stay upright
              transform: isMobile ? "rotate(-90deg)" : "none",
              transformOrigin: "center center",
              // Pull cards up on mobile (rotated, so marginLeft = visual top)
              marginLeft: isMobile ? "-72px" : "0",
            }}
          >
            {demos.map((demo, i) => (
              <DemoCard key={demo.title} demo={demo} index={i} />
            ))}
          </div>
        </div>
      </div>

      <SectionTitleOverlay imageSrc="/assets/animated/demos-title.png" />
    </section>
  );
}
