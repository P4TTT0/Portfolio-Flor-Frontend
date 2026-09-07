"use client";

import { useState } from "react";
import Image from "next/image";
import {
  extractYouTubeId,
  getYouTubeThumbnail,
  getYouTubeThumbnailHd,
} from "@/lib/youtube-utils";
import type { WorkItem } from "@/lib/use-sanity-content";

interface WorkGalleryTileProps {
  work: WorkItem;
  /** Which corner the tile grows from, so edge tiles are not clipped. */
  transformOrigin: string;
  onPlay: () => void;
}

export default function WorkGalleryTile({
  work,
  transformOrigin,
  onPlay,
}: WorkGalleryTileProps) {
  const videoId = extractYouTubeId(work.youtubeUrl);

  // maxresdefault is not generated for every video — fall back to hqdefault,
  // which always exists. Both read correctly in a 16:9 box: the HD frame fits
  // exactly, and hqdefault's letterbox bars fall outside the crop.
  const [thumbnail, setThumbnail] = useState(() =>
    videoId ? getYouTubeThumbnailHd(videoId) : null,
  );

  if (!videoId) return null;

  const meta = [work.category, work.country].filter(Boolean).join(" · ");

  return (
    // Growth is compositor-only: the tile lifts over its neighbours instead of
    // asking the grid for room, so no row is ever stretched and no gap opens.
    //
    // The transition must list `scale` explicitly. Tailwind v4 compiles
    // `scale-[1.55]` to the individual `scale` property, not to a `transform`
    // shorthand, so transitioning `transform` alone animates nothing and the
    // tile snaps. The full set mirrors Tailwind's own `transition-transform`.
    <button
      type="button"
      onClick={onPlay}
      style={{ transformOrigin }}
      className="group relative block w-full aspect-video overflow-hidden rounded-[3px] bg-neutral-900 outline-none
        shadow-[2px_4px_14px_rgba(0,0,0,0.18)]
        transition-[transform,translate,scale,rotate,box-shadow] duration-300 ease-out
        hover:z-20 hover:scale-[1.55] hover:shadow-[6px_14px_38px_rgba(0,0,0,0.35)]
        focus-visible:z-20 focus-visible:scale-[1.55] focus-visible:shadow-[6px_14px_38px_rgba(0,0,0,0.35)]
        motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100"
      aria-label={`Ver trabajo: ${work.title}`}
    >
      {thumbnail && (
        <Image
          src={thumbnail}
          alt={work.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
          onError={() => setThumbnail(getYouTubeThumbnail(videoId))}
        />
      )}

      {/*
        Caption only exists while the tile is lifted, so it is sized for the
        grown state rather than the resting one.
      */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-2 text-left opacity-0
          transition-opacity duration-300
          group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 45%, transparent 75%)",
        }}
      >
        <p
          className="text-white leading-tight truncate"
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontWeight: 700,
            fontSize: "0.62rem",
          }}
        >
          {work.title}
        </p>
        {meta && (
          <p
            className="text-white/70 leading-tight truncate"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 300,
              fontSize: "0.5rem",
            }}
          >
            {meta}
          </p>
        )}
      </div>
    </button>
  );
}
