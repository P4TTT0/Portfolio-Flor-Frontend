"use client";

import { formatTime } from "@/hooks/useAudioPlayer";

// ---------------------------------------------------------------------------
// SVG Icons (inline — tiny, no icon library needed)
// ---------------------------------------------------------------------------

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

function PauseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// TrackItem
// ---------------------------------------------------------------------------

interface TrackItemProps {
  title: string;
  duration?: number;
  isPlaying: boolean;
  hasAudio: boolean;
  onPlayPause: () => void;
}

export default function TrackItem({
  title,
  duration,
  isPlaying,
  hasAudio,
  onPlayPause,
}: TrackItemProps) {
  const actionLabel = isPlaying
    ? `Pausar ${title}`
    : `Reproducir ${title}`;

  return (
    <div
      className={`
        group flex items-center gap-3 sm:gap-4 px-3 py-2.5 rounded-md transition-colors
        ${isPlaying ? "bg-foreground/5" : "hover:bg-foreground/[0.03]"}
      `}
    >
      {/* Play / Pause button */}
      <button
        type="button"
        aria-label={hasAudio ? actionLabel : `${title} — Audio no disponible`}
        disabled={!hasAudio}
        onClick={hasAudio ? onPlayPause : undefined}
        className={`
          shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
          transition-all duration-200 border
          ${
            hasAudio
              ? "border-foreground/20 text-foreground hover:border-foreground/40 hover:bg-foreground/[0.06] active:scale-95 cursor-pointer"
              : "border-foreground/8 text-foreground/25 cursor-not-allowed"
          }
          ${isPlaying ? "bg-foreground/[0.08] border-foreground/30" : ""}
        `}
      >
        <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center">
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </span>
      </button>

      {/* Title + unavailable label */}
      <div className="flex-1 min-w-0">
        <p
          className={`
            font-heading text-sm sm:text-base tracking-wide truncate
            ${hasAudio ? "text-text-primary" : "text-text-secondary/50"}
          `}
        >
          {title}
        </p>
        {!hasAudio && (
          <p className="text-xs text-text-secondary/40 mt-0.5 leading-none">
            Audio no disponible
          </p>
        )}
      </div>

      {/* Duration */}
      <span className="shrink-0 text-xs sm:text-sm text-text-secondary/60 tabular-nums font-body">
        {formatTime(duration ?? -1)}
      </span>
    </div>
  );
}
