"use client";

import { useState } from "react";
import Image from "next/image";
import type { DemoItem } from "@/lib/use-sanity-content";
import VideoPopup from "./VideoPopup";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube-utils";
import useBreakpoint from "@/hooks/useBreakpoint";

interface DemoCardProps {
  demo: DemoItem;
  index: number;
}

// Pin dimensions in design-canvas pixels (scales naturally via parent transform)
const PIN_WIDTH = 28;
const PIN_TOP = -22;

export default function DemoCard({ demo, index }: DemoCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useBreakpoint();
  const videoId = extractYouTubeId(demo.videoUrl);
  const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null;

  // Alternating rotation: even = 1.6deg, odd = -1.6deg
  const rotation = index % 2 === 0 ? 1.6 : -1.6;

  // Touch target: ensure minimum 44×44 CSS pixels
  // At small scales the card itself shrinks; pin stays fixed px in design canvas
  // The button's intrinsic size + the card body already exceed 44×44 at base canvas
  const touchTargetStyles = isMobile ? { minWidth: 44, minHeight: 44 } : {};

  if (!videoId) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative cursor-pointer text-left"
        style={{
          transform: `rotate(${rotation}deg)`,
          ...touchTargetStyles,
        }}
        aria-label={`Ver demo: ${demo.title}`}
      >
        {/* Pin — attaches card to cork board, fixed px within design canvas */}
        <img
          src="/assets/elements/pin.png"
          alt=""
          className="absolute z-30 pointer-events-none"
          style={{
            top: PIN_TOP,
            left: "50%",
            transform: "translateX(-50%)",
            width: PIN_WIDTH,
            height: "auto",
          }}
          aria-hidden="true"
        />

        {/* Card body */}
        <div className="relative w-full bg-white rounded-sm shadow-[2px_3px_12px_rgba(0,0,0,0.15)] overflow-hidden border border-neutral-200/50">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-neutral-100 overflow-hidden">
            {thumbnail && (
              <Image
                src={thumbnail}
                alt={demo.title}
                width={480}
                height={360}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            )}

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-800 ml-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Title label — responsive font sizes */}
          <div className="px-3 py-2 bg-cream/80">
            <p className="font-heading text-xs sm:text-sm md:text-base text-text-primary font-semibold truncate">
              {demo.title}
            </p>
            {demo.category && (
              <p className="font-body text-[10px] sm:text-xs text-text-secondary/70 uppercase tracking-wider mt-0.5">
                {demo.category}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Video popup */}
      {isOpen && (
        <VideoPopup
          videoId={videoId}
          title={demo.title}
          category={demo.category}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
