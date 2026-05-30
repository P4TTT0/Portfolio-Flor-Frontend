"use client";

import { useMemo } from "react";
import Clip from "@/components/craft/Clip";

// ---------------------------------------------------------------------------
// FolderPapers — two stacked paper sheets with integrated folder tabs
// ---------------------------------------------------------------------------

interface FolderPapersProps {
  categories: string[];
  activeCategory: string;
  onTabChange: (category: string) => void;
  children: React.ReactNode;
}

const PAPER_BG = "#F5F0E8";
const TAB_HEIGHT = 56;
const PEEK_PX = 7;
const EASE_OUT_QUART = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";

// SVG viewBox dimensions
const W = 700;
const H = 500;
const T = 56; // tab height in SVG units
const TAB_W = 200; // tab width in SVG units
const TR = 28; // tab corner radius (semicircle top)
const CR = 20; // concave curve radius
const R = 12; // body corner radius

function leftPath(): string {
  return `M0 ${H}V${TR}Q0 0 ${TR} 0H${TAB_W - TR}Q${TAB_W} 0 ${TAB_W} ${TR}V${T - CR}Q${TAB_W} ${T} ${TAB_W + CR} ${T}H${W - R}Q${W} ${T} ${W} ${T + R}V${H - R}Q${W} ${H} ${W - R} ${H}H${R}Q0 ${H} 0 ${H - R}Z`;
}

function rightPath(): string {
  const tL = W - TAB_W;
  return `M0 ${H}V${T + R}Q0 ${T} ${R} ${T}H${tL - CR}Q${tL} ${T} ${tL} ${T - CR}V${TR}Q${tL} 0 ${tL + TR} 0H${W - TR}Q${W} 0 ${W} ${TR}V${H - R}Q${W} ${H} ${W - R} ${H}H${R}Q0 ${H} 0 ${H - R}Z`;
}

function toMask(path: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='none'><path d='${path}' fill='#fff'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export default function FolderPapers({
  categories,
  activeCategory,
  onTabChange,
  children,
}: FolderPapersProps) {
  const shapes = useMemo(() => {
    const lp = leftPath();
    const rp = rightPath();
    return [
      { path: lp, mask: toMask(lp) },
      { path: rp, mask: toMask(rp) },
    ];
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="relative w-full max-w-[min(80vw,700px)] z-50">
      <div
        className="relative flex flex-col"
        style={{
          maxHeight: "calc(100vh - 6rem)",
          minHeight: "min(28rem, calc(100vh - 6rem))",
          paddingTop: TAB_HEIGHT + PEEK_PX,
        }}
        role="tablist"
        aria-label="Categorías de samples"
      >
        {categories.map((cat, i) => {
          const isActive = cat === activeCategory;
          const isLeft = i === 0;
          const { path, mask } = shapes[i];

          return (
            <div
              key={cat}
              className="absolute left-0 right-0 bottom-0"
              style={{
                top: isActive ? PEEK_PX : 0,
                zIndex: isActive ? 2 : 1,
                transition: `all 350ms ${EASE_OUT_QUART}`,
                opacity: isActive ? 1 : 0.85,
              }}
            >
              <div
                className="relative w-full h-full"
                style={{ filter: "drop-shadow(3px 8px 15px rgba(0,0,0,0.12))" }}
              >
                {/* Paper shape — SVG with continuous curves */}
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full"
                  aria-hidden="true"
                >
                  <path
                    d={path}
                    fill={PAPER_BG}
                    stroke="#C9AD86"
                    strokeOpacity="0.15"
                    strokeWidth="2"
                  />
                </svg>

                {/* Texture overlay — masked to paper shape */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    maskImage: mask,
                    maskSize: "100% 100%",
                    WebkitMaskImage: mask,
                    WebkitMaskSize: "100% 100%",
                    backgroundImage: "url('/assets/textures/rough-paper.jpg')",
                    backgroundSize: "300px 300px",
                    backgroundRepeat: "repeat",
                    opacity: 0.5,
                  }}
                />

                {/* Tab button placeholder — actual button is rendered outside */}

                {/* Content */}
                {isActive && (
                  <div
                    className="absolute left-0 right-0 bottom-0 flex flex-col min-h-0 px-4 sm:px-6 pt-2 pb-4 sm:pb-6"
                    style={{ top: `${(T / H) * 100}%`, zIndex: 10 }}
                  >
                    {children}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Tab buttons — rendered outside paper wrappers for proper z-index */}
        {categories.map((cat, i) => {
          const isActive = cat === activeCategory;
          const isLeft = i === 0;

          return (
            <button
              key={`tab-${cat}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(cat)}
              className={`
                absolute font-heading text-xs sm:text-sm font-semibold tracking-wide
                border-0 bg-transparent cursor-pointer
                flex items-center justify-center
                transition-all duration-350
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
                ${isActive ? "text-text-primary" : "text-text-secondary/50 hover:text-text-secondary/70"}
              `}
              style={{
                top: isActive ? PEEK_PX : 0,
                [isLeft ? "left" : "right"]: 0,
                width: `${(TAB_W / W) * 100}%`,
                height: TAB_HEIGHT,
                zIndex: 30,
                transitionTimingFunction: EASE_OUT_QUART,
              }}
            >
              {cat}
            </button>
          );
        })}

      </div>
    </div>
  );
}
