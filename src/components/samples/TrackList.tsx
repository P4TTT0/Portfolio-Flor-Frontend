"use client";

import { useEffect, useRef } from "react";
import type { SampleItem } from "@/lib/use-sanity-content";
import TrackItem from "@/components/samples/TrackItem";

interface TrackListProps {
  tracks: SampleItem[];
  activeTrackUrl: string | null;
  isWaveformPlaying: boolean;
  onPlayPause: (track: SampleItem) => void;
}

export default function TrackList({
  tracks,
  activeTrackUrl,
  isWaveformPlaying,
  onPlayPause,
}: TrackListProps) {
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Scroll active track into view when it changes (e.g. auto-advance)
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeTrackUrl]);

  if (tracks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="font-heading text-base sm:text-lg text-text-secondary/30 tracking-wide">
          No hay tracks en esta categoría
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto overscroll-behavior-contain px-2 sm:px-4"
      style={{ touchAction: "pan-y" }}
      role="list"
      aria-label="Lista de tracks"
    >
      <div className="flex flex-col gap-0.5 py-2">
        {tracks.map((track) => {
          const hasAudio = !!track.audioUrl;
          const isThisActive = activeTrackUrl === track.audioUrl && hasAudio;
          const isThisPlaying = isThisActive && isWaveformPlaying;

          return (
            <div
              key={track.title || track.audioUrl}
              ref={isThisActive ? activeItemRef : undefined}
            >
              <TrackItem
                title={track.title}
                duration={track.duration}
                isActive={isThisActive}
                isPlaying={isThisPlaying}
                selectionKey={isThisActive ? activeTrackUrl : null}
                hasAudio={hasAudio}
                onPlayPause={() => onPlayPause(track)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
