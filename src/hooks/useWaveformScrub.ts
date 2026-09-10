"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// useWaveformScrub — pointer interaction layer for a horizontal seek surface
// ---------------------------------------------------------------------------
// Deliberately knows nothing about audio. It reports where the pointer is
// (0–1 along the target element) and commits a single position when the drag
// ends. Committing on every move would mean rebuilding the audio graph ~60
// times a second, which is both audible and wasteful.

interface UseWaveformScrubOptions {
  /** Element the pointer coordinates are measured against. */
  targetRef: React.RefObject<Element | null>;
  /** Called once with the final position (0–1) when a drag or click ends. */
  onCommit: (fraction: number) => void;
  disabled?: boolean;
}

export interface UseWaveformScrubReturn {
  isScrubbing: boolean;
  /** Position being dragged to (0–1), or null when no drag is in progress. */
  scrubFraction: number | null;
  /** Position under the pointer while hovering (0–1), or null when away. */
  hoverFraction: number | null;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
  };
}

export function useWaveformScrub({
  targetRef,
  onCommit,
  disabled = false,
}: UseWaveformScrubOptions): UseWaveformScrubReturn {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubFraction, setScrubFraction] = useState<number | null>(null);
  const [hoverFraction, setHoverFraction] = useState<number | null>(null);

  const scrubbingRef = useRef(false);
  const lastFractionRef = useRef<number | null>(null);

  // One state update per animation frame. High-polling-rate pointers fire
  // several move events between paints and every extra render redraws all
  // hundred waveform bars.
  const frameRef = useRef(0);
  const pendingRef = useRef<number | null>(null);

  const cancelFrame = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    pendingRef.current = null;
  }, []);

  useEffect(() => cancelFrame, [cancelFrame]);

  const fractionFromEvent = useCallback(
    (clientX: number): number | null => {
      const rect = targetRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return null;
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    },
    [targetRef],
  );

  const schedule = useCallback((fraction: number) => {
    lastFractionRef.current = fraction;
    pendingRef.current = fraction;
    if (frameRef.current) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const next = pendingRef.current;
      pendingRef.current = null;
      if (next === null) return;

      if (scrubbingRef.current) {
        setScrubFraction(next);
        setHoverFraction(next);
      } else {
        setHoverFraction(next);
      }
    });
  }, []);

  const endScrub = useCallback(
    (e: React.PointerEvent, commit: boolean) => {
      if (!scrubbingRef.current) return;

      cancelFrame();
      const target = e.currentTarget;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }

      const fraction = fractionFromEvent(e.clientX) ?? lastFractionRef.current;

      scrubbingRef.current = false;
      setIsScrubbing(false);
      setScrubFraction(null);

      // Touch and pen have no lingering hover state to show.
      if (e.pointerType !== "mouse") {
        setHoverFraction(null);
        lastFractionRef.current = null;
      }

      if (commit && fraction !== null) onCommit(fraction);
    },
    [cancelFrame, fractionFromEvent, onCommit],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      // Ignore secondary mouse buttons; touch and pen report button 0 too.
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const fraction = fractionFromEvent(e.clientX);
      if (fraction === null) return;

      // Stops the drag from turning into a text selection.
      e.preventDefault();
      // Capturing keeps move/up events coming even once the pointer leaves
      // the waveform box, so the drag survives overshooting the edges.
      e.currentTarget.setPointerCapture(e.pointerId);

      cancelFrame();
      scrubbingRef.current = true;
      lastFractionRef.current = fraction;
      setIsScrubbing(true);
      setScrubFraction(fraction);
      setHoverFraction(fraction);
    },
    [disabled, fractionFromEvent, cancelFrame],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      const fraction = fractionFromEvent(e.clientX);
      if (fraction === null) return;
      schedule(fraction);
    },
    [disabled, fractionFromEvent, schedule],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => endScrub(e, true),
    [endScrub],
  );

  // A cancelled gesture (system gesture, page scroll takeover) should not move
  // the playhead — drop it instead of committing a half-finished drag.
  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => endScrub(e, false),
    [endScrub],
  );

  const onPointerLeave = useCallback(() => {
    if (scrubbingRef.current) return;
    cancelFrame();
    lastFractionRef.current = null;
    setHoverFraction(null);
  }, [cancelFrame]);

  return {
    isScrubbing,
    scrubFraction,
    hoverFraction,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
    },
  };
}
