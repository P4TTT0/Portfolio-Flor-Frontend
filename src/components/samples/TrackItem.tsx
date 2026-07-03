"use client";

import { formatTime } from "@/hooks/useAudioPlayer";

function PauseIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

const BAR_H = 14; // px
const PAUSE_SCALES = [0.25, 0.55, 0.38];

// Animated sound bars — the universal "now playing" indicator
// Animation is driven via CSS class (.sound-bar-anim) to avoid inline
// animation↔none switching issues in certain browsers.
function SoundBars({ playing }: { playing: boolean }) {
  return (
    <div
      className="flex items-end gap-[2px] shrink-0"
      style={{ height: BAR_H }}
      aria-hidden="true"
    >
      {PAUSE_SCALES.map((pauseScale, i) => (
        <span
          key={i}
          className={`w-[2.5px] rounded-full bg-foreground/45 block ${playing ? "sound-bar-anim" : ""}`}
          style={{
            height: BAR_H,
            transformOrigin: "bottom center",
            transform: playing ? undefined : `scaleY(${pauseScale})`,
          }}
        />
      ))}
    </div>
  );
}

interface TrackItemProps {
  title: string;
  duration?: number;
  isActive: boolean;
  isPlaying: boolean;
  selectionKey: string | null;
  hasAudio: boolean;
  onPlayPause: () => void;
}

export default function TrackItem({
  title,
  duration,
  isActive,
  isPlaying,
  selectionKey,
  hasAudio,
  onPlayPause,
}: TrackItemProps) {
  const actionLabel = isPlaying ? `Pausar ${title}` : `Reproducir ${title}`;

  return (
    <div
      className={`group relative flex items-center gap-3 sm:gap-4 px-3 py-2.5 rounded-md transition-colors duration-200 ${
        isActive
          ? isPlaying
            ? "bg-foreground/[0.08]"
            : "bg-foreground/[0.05]"
          : "hover:bg-foreground/[0.03]"
      }`}
    >
      {/* Left accent border — absolute to avoid layout shift */}
      {isActive && (
        <div
          className={`absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full transition-opacity duration-300 ${
            isPlaying ? "bg-foreground/50" : "bg-foreground/25"
          }`}
          aria-hidden="true"
        />
      )}

      {/* Flash overlay — key changes on each new selection to replay animation */}
      {isActive && selectionKey && (
        <div
          key={selectionKey}
          className="absolute inset-0 rounded-md pointer-events-none bg-foreground/[0.12]"
          style={{ animation: "track-flash 500ms ease-out forwards" }}
          aria-hidden="true"
        />
      )}

      {/* Play / Pause button */}
      <button
        type="button"
        aria-label={hasAudio ? actionLabel : `${title} — Audio no disponible`}
        disabled={!hasAudio}
        onClick={hasAudio ? onPlayPause : undefined}
        className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 border ${
          !hasAudio
            ? "border-foreground/8 text-foreground/25 cursor-not-allowed"
            : isActive
            ? isPlaying
              ? "bg-foreground/[0.10] border-foreground/40 text-foreground hover:bg-foreground/[0.14] cursor-pointer active:scale-95"
              : "bg-foreground/[0.06] border-foreground/30 text-foreground hover:bg-foreground/[0.10] cursor-pointer active:scale-95"
            : "border-foreground/20 text-foreground hover:border-foreground/40 hover:bg-foreground/[0.06] cursor-pointer active:scale-95"
        }`}
      >
        <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center">
          {isActive && isPlaying ? <PauseIcon /> : <PlayIcon />}
        </span>
      </button>

      {/* Title + sound bars */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <p
          className={`font-heading text-sm sm:text-base tracking-wide truncate transition-colors duration-200 ${
            !hasAudio
              ? "text-text-secondary/50"
              : isActive
              ? "text-text-primary font-semibold"
              : "text-text-primary"
          }`}
        >
          {title}
        </p>
        {!hasAudio && (
          <p className="text-xs text-text-secondary/40 shrink-0 leading-none">
            Audio no disponible
          </p>
        )}
        {isActive && hasAudio && <SoundBars playing={isPlaying} />}
      </div>

      {/* Duration */}
      <span className="shrink-0 text-xs sm:text-sm text-text-secondary/60 tabular-nums font-body">
        {formatTime(duration ?? -1)}
      </span>
    </div>
  );
}
