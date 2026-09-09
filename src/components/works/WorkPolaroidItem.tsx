"use client";

import { useState } from "react";
import Image from "next/image";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube-utils";
import VideoPopup from "@/components/demos/VideoPopup";
import type { WorkItem } from "@/lib/use-sanity-content";

interface WorkPolaroidItemProps {
  work: WorkItem;
  rotation?: number;
  floatDuration?: number;
  reverse?: boolean;
  onPlay?: () => void;
}

// Photo area within polaroid-frame-02.png (percentages)
const PHOTO = {
  top: "6.5%",
  left: "7.8%",
  right: "7.8%",
  bottom: "22%",
};

export default function WorkPolaroidItem({
  work,
  rotation = -8,
  floatDuration = 4,
  reverse = false,
  onPlay,
}: WorkPolaroidItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const videoId = extractYouTubeId(work.youtubeUrl);
  const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null;

  if (!videoId) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => onPlay ? onPlay() : setIsOpen(true)}
        className={`group cursor-pointer text-left flex flex-col items-center gap-8 sm:gap-14 lg:gap-20 ${
          reverse ? "sm:flex-row-reverse" : "sm:flex-row"
        }`}
        aria-label={`Ver trabajo: ${work.title}`}
      >
        {/*
          Two-layer wrapper to avoid transform conflicts:
          - Outer: static rotation only
          - Inner: float animation (translateY) + dimensions
        */}
        <div
          style={{
            flexShrink: 0,
            transform: `rotate(${rotation}deg)`,
            filter: "drop-shadow(2px 8px 20px rgba(0,0,0,0.18))",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "clamp(200px, 28vw, 340px)",
              aspectRatio: "5 / 6",
              animation: `polaroid-float ${floatDuration}s ease-in-out infinite`,
              animationDelay: "0.8s",
            }}
          >
            {/* Thumbnail — below the frame */}
            {thumbnail && (
              <div
                style={{
                  position: "absolute",
                  top: PHOTO.top,
                  left: PHOTO.left,
                  right: PHOTO.right,
                  bottom: PHOTO.bottom,
                  overflow: "hidden",
                  zIndex: 0,
                }}
              >
                {/*
                  The photo area is near square (0.844W wide by 0.858W tall), so
                  `object-cover` alone would fit the 4:3 thumbnail by height and
                  crop the sides, keeping YouTube's letterbox bars on screen.

                  This 16:9 window fixes that. It is sized off the photo area's
                  height, so it always overflows horizontally and is clipped by
                  the parent. `object-cover` inside it fits the 4:3 source by
                  width instead, pushing the bars out of frame. A 16:9 source
                  (maxresdefault) fills the window exactly, so the wrapper stays
                  correct whichever thumbnail variant is used.
                */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    aspectRatio: "16 / 9",
                  }}
                >
                  <Image
                    src={thumbnail}
                    alt={work.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 320px, 43vw"
                  />
                </div>
              </div>
            )}

            {/* Polaroid frame — above the thumbnail */}
            <img
              src="/assets/elements/polaroid-frame-02.png"
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "fill",
                zIndex: 10,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Text */}
        <div className="text-center sm:text-left">
          <p
            className="text-text-primary leading-tight"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 700,
              fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
            }}
          >
            {work.title}
          </p>
          <p
            className="text-text-secondary mt-1"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 300,
              fontSize: "clamp(1rem, 2vw, 1.6rem)",
            }}
          >
            {work.category}
          </p>
          <p
            className="text-text-secondary"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 300,
              fontSize: "clamp(1rem, 2vw, 1.6rem)",
            }}
          >
            {work.country}
          </p>
        </div>
      </button>

      {isOpen && (
        <VideoPopup
          videoId={videoId}
          title={work.title}
          category={work.category ?? ""}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
