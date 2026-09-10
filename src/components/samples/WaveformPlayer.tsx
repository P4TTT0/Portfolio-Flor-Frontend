"use client";

import { useCallback, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import { useAudioPlayer, formatTime, PEAK_BUCKETS } from "@/hooks/useAudioPlayer";
import { useWaveformScrub } from "@/hooks/useWaveformScrub";

// ---------------------------------------------------------------------------
// WaveformPlayer — SVG ink-stroke waveform + playback controls
// ---------------------------------------------------------------------------

// Bar geometry constants (module-level: PEAK_BUCKETS is a constant, no reason
// to recompute these on every render — also keeps useMemo deps clean)
const BAR_GAP = 2;
const BAR_WIDTH = Math.max(0.4, 100 / PEAK_BUCKETS - BAR_GAP);

/** Accent used for every scrub affordance, matching the player's border tone. */
const ACCENT = "#C9AD86";

/** How far either side of the pointer the bars react, as a fraction of width. */
const FOCUS_RADIUS = 0.08;

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
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const {
    isPlaying,
    currentTime,
    duration,
    peaks,
    volume,
    isMuted,
    loading,
    error,
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
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

  const isEmpty = !audioUrl;

  // Drag-to-seek. The commit is deliberately a single call on release: seek()
  // tears down and rebuilds the AudioBufferSourceNode, so firing it on every
  // pointermove would be audible (clicks between sources) and expensive.
  // Playback keeps running from its old position while you drag — the playhead
  // and the clock preview where you are about to land.
  const { isScrubbing, scrubFraction, hoverFraction, handlers } = useWaveformScrub({
    targetRef: svgRef,
    onCommit: seek,
    disabled: loading || !!error || isEmpty,
  });

  /** Where the playhead sits: the drag position while dragging, else playback. */
  const displayFraction = scrubFraction ?? progress;
  /** Where the pointer is: drives the bar swell and the time bubble. */
  const focusFraction = scrubFraction ?? hoverFraction;

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

  // Build SVG bars — bottom-to-top growth with spacing, fade-out, and a swell
  // that follows the pointer
  const waveformBars = useMemo(() => {
    if (peaks.length === 0) return null;

    const count = Math.min(peaks.length, PEAK_BUCKETS);
    const bars: React.ReactNode[] = [];
    const swellStrength = isScrubbing ? 0.55 : 0.25;

    for (let i = 0; i < count; i++) {
      const peak = peaks[i] || 0;
      const pos = i / count;
      const isPlayed = pos <= displayFraction;

      // Proximity to the pointer: 1 right under it, 0 at the edge of the
      // window, with a cosine falloff so the swell has no hard seam.
      let focusWeight = 0;
      if (focusFraction !== null) {
        const distance = Math.abs(pos - focusFraction);
        if (distance < FOCUS_RADIUS) {
          focusWeight = 0.5 + 0.5 * Math.cos((distance / FOCUS_RADIUS) * Math.PI);
        }
      }

      // Opacity: played = tenue/vibrante, pending = apagado/desaturado
      const baseOpacity = 0.55 + Math.sin(i * 0.73 + 1.2) * 0.12;
      const opacity = isPlayed ? baseOpacity : baseOpacity * 0.3;

      // Fade-out on the right edge (last 20%)
      const fadeStart = 0.8;
      const fadeFactor = pos > fadeStart ? 1 - ((pos - fadeStart) / 0.2) * 0.6 : 1;

      // Bottom-to-top: y = (1 - height) * 100, bar extends downward
      const height = Math.min(1, peak * (1 + swellStrength * focusWeight));
      const x = pos * 100;
      const y = (1 - height) * 100;

      bars.push(
        <rect
          key={i}
          x={`${x}%`}
          y={`${y}%`}
          width={`${BAR_WIDTH}%`}
          height={`${height * 100}%`}
          rx={BAR_WIDTH / 2}
          ry={BAR_WIDTH / 2}
          fill={focusWeight > 0.08 ? ACCENT : "var(--color-foreground, #3D3D3D)"}
          opacity={Math.max(
            0.06,
            Math.min(1, (opacity + focusWeight * 0.45) * fadeFactor),
          )}
          // Transitions smooth the played/pending boundary, but during a drag
          // they smear the swell a frame behind the finger.
          style={{ transition: isScrubbing ? "none" : "opacity 150ms ease" }}
        />,
      );
    }

    return bars;
  }, [peaks, displayFraction, focusFraction, isScrubbing]);

  // While dragging, both the clock and the assistive-tech value report the
  // position being dragged to, not the sound currently coming out.
  const previewTime = isScrubbing ? displayFraction * duration : currentTime;
  const durationDisplay = loading ? "--:--" : formatTime(duration);
  const currentDisplay = formatTime(previewTime);

  const showOverlay = !loading && !error && !isEmpty;
  const playheadLeft = `${displayFraction * 100}%`;
  // Keep the bubble inside the box instead of letting it clip at the edges.
  const bubbleLeft =
    focusFraction === null
      ? 0
      : Math.min(92, Math.max(8, focusFraction * 100));

  return (
    <div className="shrink-0 px-2 sm:px-4 pb-2 pt-2">
      <div className="flex flex-col gap-2">
        {/* Waveform SVG area */}
        <div
          ref={sliderRef}
          className={`
            relative h-14 sm:h-16 rounded-md border overflow-hidden select-none
            transition-colors duration-200
            ${isScrubbing
              ? "border-[#C9AD86]/60 bg-foreground/[0.04]"
              : "border-[#C9AD86]/15 bg-foreground/[0.02]"}
          `}
          role="slider"
          aria-label="Progreso de reproducción"
          aria-orientation="horizontal"
          aria-valuenow={Math.round(previewTime)}
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

          {showOverlay && (
            <svg
              ref={svgRef}
              className={`w-full h-full ${isScrubbing ? "cursor-grabbing" : "cursor-grab"}`}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              // Claims the gesture so a horizontal drag never becomes a scroll.
              style={{ touchAction: "none" }}
              {...handlers}
              onPointerDown={(e) => {
                handlers.onPointerDown(e);
                // The hook calls preventDefault to stop the drag becoming a text
                // selection, which also suppresses the focus a mousedown would
                // normally hand the slider — arrow keys must work right after a
                // click, so grant it back explicitly.
                sliderRef.current?.focus();
              }}
              aria-hidden="true"
            >
              {waveformBars}
            </svg>
          )}

          {/* Scrub affordances live in HTML, not SVG: preserveAspectRatio="none"
              stretches the viewBox non-uniformly, which would turn the round
              handle into an ellipse and skew its ring. */}
          {showOverlay && (
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              {/* Glow behind the playhead — blooms while dragging */}
              <div
                className="absolute inset-y-0 -translate-x-1/2 transition-[width,opacity] duration-200 ease-out"
                style={{
                  left: playheadLeft,
                  width: isScrubbing ? "48px" : "18px",
                  opacity: isScrubbing ? 1 : hoverFraction !== null ? 0.55 : 0,
                  background: `radial-gradient(closest-side, ${ACCENT}59, transparent)`,
                }}
              />

              {/* Preview line under the pointer while hovering (pre-drag hint) */}
              {!isScrubbing && hoverFraction !== null && (
                <div
                  className="absolute inset-y-0 w-px -translate-x-1/2"
                  style={{
                    left: `${hoverFraction * 100}%`,
                    background: ACCENT,
                    opacity: 0.45,
                  }}
                />
              )}

              {/* Playhead line */}
              <div
                className="absolute inset-y-0 -translate-x-1/2 transition-[width] duration-150 ease-out"
                style={{
                  left: playheadLeft,
                  width: isScrubbing ? "2px" : "1px",
                  background: isScrubbing ? ACCENT : "var(--color-foreground, #3D3D3D)",
                  opacity: isScrubbing ? 0.95 : 0.5,
                }}
              />

              {/* Drag handle — hidden until the surface is hovered or grabbed */}
              <div
                className="absolute top-1/2 rounded-full transition-transform duration-150 ease-out"
                style={{
                  left: playheadLeft,
                  width: "12px",
                  height: "12px",
                  marginLeft: "-6px",
                  marginTop: "-6px",
                  background: ACCENT,
                  boxShadow:
                    "0 0 0 2px var(--color-background, #F5F2EB), 0 2px 6px rgba(61, 61, 61, 0.25)",
                  transform: `scale(${isScrubbing ? 1.3 : hoverFraction !== null ? 1 : 0})`,
                }}
              />

              {/* Time bubble following the pointer */}
              {focusFraction !== null && (
                <div
                  className="absolute top-1 -translate-x-1/2 rounded px-1.5 py-0.5 font-body text-[10px] leading-none tabular-nums text-background"
                  style={{
                    left: `${bubbleLeft}%`,
                    background: "rgba(61, 61, 61, 0.88)",
                  }}
                >
                  {formatTime(focusFraction * duration)}
                </div>
              )}
            </div>
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
          <span
            className={`text-xs sm:text-sm tabular-nums font-body transition-colors duration-150 ${
              isScrubbing ? "text-[#C9AD86]" : "text-text-secondary/60"
            }`}
          >
            {currentDisplay}
            <span className="mx-1 text-text-secondary/30">/</span>
            {durationDisplay}
          </span>

          {/* Volume slider */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Mute toggle — restores the previous level, never resets it */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Activar sonido" : "Silenciar"}
              aria-pressed={isMuted}
              className={`
                shrink-0 p-1 -m-1 rounded cursor-pointer
                transition-colors duration-150
                ${isMuted ? "text-[#C9AD86]" : "text-text-secondary/40 hover:text-text-secondary/70"}
              `}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="w-3.5 h-3.5"
                aria-hidden="true"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                {isMuted ? (
                  <>
                    <path d="M16.5 9.5l5 5" />
                    <path d="M21.5 9.5l-5 5" />
                  </>
                ) : (
                  <>
                    {volume > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
                    {volume > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
                  </>
                )}
              </svg>
            </button>
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
