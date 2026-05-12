"use client";

import { useState } from "react";
import Image from "next/image";
import type { DemoItem } from "@/lib/use-sanity-content";
import VideoPopup from "./VideoPopup";
import { extractYouTubeId, getYouTubeThumbnail, randomRotation } from "@/lib/youtube-utils";

interface DemoCardProps {
  demo: DemoItem;
}

export default function DemoCard({ demo }: DemoCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const videoId = extractYouTubeId(demo.videoUrl);
  const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null;
  const rotation = randomRotation(-3, 3);

  if (!videoId) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative cursor-pointer text-left"
        style={{ transform: `rotate(${rotation}deg)` }}
        aria-label={`Ver demo: ${demo.title}`}
      >
        {/* Wooden clip — attaches card to rope */}
        <img
          src="/assets/elements/wooden-clip.png"
          alt=""
          className="absolute z-20 pointer-events-none"
          style={{
            top: "-14px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "32px",
            height: "auto",
          }}
          aria-hidden="true"
        />

        {/* Card body */}
        <div className="relative w-44 sm:w-48 md:w-52 bg-white rounded-sm shadow-[2px_3px_12px_rgba(0,0,0,0.15)] overflow-hidden border border-neutral-200/50">
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

          {/* Title label */}
          <div className="px-3 py-2 bg-cream/80">
            <p className="font-heading text-xs sm:text-sm text-text-primary font-semibold truncate">
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
