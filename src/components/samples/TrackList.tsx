"use client";

import type { SampleItem } from "@/lib/use-sanity-content";
import TrackItem from "@/components/samples/TrackItem";

// ---------------------------------------------------------------------------
// TrackList
// ---------------------------------------------------------------------------

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
          const isThisActive = activeTrackUrl === track.audioUrl;
          const isThisPlaying = isThisActive && isWaveformPlaying;

          return (
            <TrackItem
              key={track.title || track.audioUrl}
              title={track.title}
              duration={track.duration}
              isPlaying={isThisPlaying}
              hasAudio={hasAudio}
              onPlayPause={() => onPlayPause(track)}
            />
          );
        })}
      </div>
    </div>
  );
}
