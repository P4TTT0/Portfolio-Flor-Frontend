"use client";

import { useCallback, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import { useAudioPlayer, formatTime, PEAK_BUCKETS } from "@/hooks/useAudioPlayer";

// ---------------------------------------------------------------------------
// WaveformPlayer — SVG ink-stroke waveform + playback controls
// ---------------------------------------------------------------------------

// Bar geometry constants (module-level: PEAK_BUCKETS is a constant, no reason
// to recompute these on every render — also keeps useMemo deps clean)
const BAR_GAP = 2;
const BAR_WIDTH = Math.max(0.4, 100 / PEAK_BUCKETS - BAR_GAP);

export interface WaveformPlayerHandle {
  play: () => void;
  pause: () => void;
}

interface WaveformPlayerProps {
  audioUrl: string | null;
  /** Called whenever internal play/pause state changes (for parent coordination). */
  onPlayStateChange?: (isPlaying: boolean) => void;
  /** Called when the track finishes playing naturally (not on manual pause/stop). */
  onEnded?: () => void;
}

const WaveformPlayer = forwardRef<WaveformPlayerHandle, WaveformPlayerProps>(
  function WaveformPlayer({ audioUrl, onPlayStateChange, onEnded }, ref) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const {
    isPlaying,
    currentTime,
    duration,
    peaks,
    volume,
    loading,
    error,
    play,
    pause,
    seek,
    setVolume,
  } = useAudioPlayer(audioUrl ?? "", onEnded);

  // Expose play / pause to parent
  useImperativeHandle(
    ref,
    () => ({ play, pause }),
    [play, pause],
  );

  // Notify parent when playback state changes
  useEffect(() => {
    onPlayStateChange?.(isPlaying);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // --- helpers (must be before early return to satisfy Rules of Hooks) ---

  const progress = duration > 0 ? currentTime / duration : 0;

  const handleWaveformClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const fraction = x / rect.width;
      seek(Math.max(0, Math.min(1, fraction)));
    },
    [seek],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        seek(Math.min(1, progress + 0.05));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        seek(Math.max(0, progress - 0.05));
      }
    },
    [progress, seek],
  );

  // Bar geometry constants live at module scope (see top of file)

  // Build SVG bars — bottom-to-top growth with spacing, fade-out, and playhead
  const waveformBars = useMemo(() => {
    if (peaks.length === 0) return null;

    const count = Math.min(peaks.length, PEAK_BUCKETS);
    const bars: React.ReactNode[] = [];

    for (let i = 0; i < count; i++) {
      const peak = peaks[i] || 0;
      const pos = i / count;
      const isPlayed = pos <= progress;

      // Opacity: played = tenue/vibrante, pending = apagado/desaturado
      const baseOpacity = 0.55 + Math.sin(i * 0.73 + 1.2) * 0.12;
      const opacity = isPlayed ? baseOpacity : baseOpacity * 0.3;

      // Fade-out on the right edge (last 20%)
      const fadeStart = 0.8;
      const fadeFactor = pos > fadeStart ? 1 - ((pos - fadeStart) / 0.2) * 0.6 : 1;

      // Bottom-to-top: y = (1 - peak) * 100, bar extends downward
      const x = pos * 100;
      const y = (1 - peak) * 100;

      bars.push(
        <rect
          key={i}
          x={`${x}%`}
          y={`${y}%`}
          width={`${BAR_WIDTH}%`}
          height={`${peak * 100}%`}
          rx={BAR_WIDTH / 2}
          ry={BAR_WIDTH / 2}
          fill="var(--color-foreground, #3D3D3D)"
          opacity={Math.max(0.06, opacity * fadeFactor)}
          style={{ transition: "opacity 150ms ease" }}
        />,
      );
    }

    // Playhead — thin vertical line at current position
    bars.push(
      <line
        key="playhead"
        x1={`${progress * 100}%`}
        y1="0"
        x2={`${progress * 100}%`}
        y2="100"
        stroke="var(--color-foreground, #3D3D3D)"
        strokeWidth="0.3"
        opacity="0.5"
      />,
    );

    return bars;
  }, [peaks, progress]);

  const durationDisplay = loading ? "--:--" : formatTime(duration);
  const currentDisplay = formatTime(currentTime);

  const isEmpty = !audioUrl;

  return (
    <div className="shrink-0 px-2 sm:px-4 pb-2 pt-2">
      <div className="flex flex-col gap-2">
        {/* Waveform SVG area */}
        <div
          className="relative h-14 sm:h-16 rounded-md border border-[#C9AD86]/15 bg-foreground/[0.02] overflow-hidden"
          role="slider"
          aria-label="Progreso de reproducción"
          aria-valuenow={Math.round(currentTime)}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration) || 0}
          aria-valuetext={`${currentDisplay} de ${durationDisplay}`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/[0.02] z-10">
              <span className="font-heading text-xs text-text-secondary/40 tracking-wider animate-pulse">
                Cargando…
              </span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/[0.02] z-10">
              <span className="font-heading text-xs text-red-400/70 tracking-wide text-center px-3">
                {error}
              </span>
            </div>
          )}

          {!loading && !error && !isEmpty && (
            <svg
              ref={svgRef}
              className="w-full h-full cursor-pointer"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              onClick={handleWaveformClick}
              aria-hidden="true"
            >
              {waveformBars}
            </svg>
          )}
        </div>

        {/* Bottom row: play/pause + time + volume */}
        <div className="flex items-center gap-3">
          {/* Play / Pause button */}
          <button
            type="button"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            onClick={isPlaying ? pause : play}
            disabled={loading || !!error || isEmpty}
            className={`
              shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
              border border-foreground/20 text-foreground
              transition-all duration-200
              hover:border-foreground/40 hover:bg-foreground/[0.06]
              active:scale-95 cursor-pointer
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            <span className="w-4 h-4 flex items-center justify-center">
              {isPlaying ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="w-full h-full"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="w-full h-full"
                >
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              )}
            </span>
          </button>

          {/* Time display */}
          <span className="text-xs sm:text-sm text-text-secondary/60 tabular-nums font-body">
            {currentDisplay}
            <span className="mx-1 text-text-secondary/30">/</span>
            {durationDisplay}
          </span>

          {/* Volume slider */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Speaker icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-3.5 h-3.5 text-text-secondary/40 shrink-0"
              aria-hidden="true"
            >
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              {volume > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
              {volume > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Volumen"
              className="volume-slider w-14 sm:w-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default WaveformPlayer;
