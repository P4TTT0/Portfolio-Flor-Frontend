"use client";

import { useState, useEffect, useRef } from "react";

type Phase = "hidden" | "visible" | "fading";

interface SectionTitleOverlayProps {
  imageSrc: string;
  duration?: number;
  imageWidth?: string;
  /**
   * Element whose crossing of the viewport center drives the overlay.
   * Defaults to the closest <section>. Pass a wrapper spanning several slides
   * to treat them as a single screen.
   *
   * The overlay always fills its own parent box, so a target taller than the
   * viewport needs a viewport-sized positioned wrapper (see WorksSection).
   */
  targetRef?: React.RefObject<HTMLElement | null>;
}

export default function SectionTitleOverlay({
  imageSrc,
  duration = 2000,
  imageWidth = "60vw",
  targetRef,
}: SectionTitleOverlayProps) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const target = targetRef?.current ?? anchorRef.current?.closest("section");
    if (!target) return;

    const clearTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        clearTimer();

        if (!entry.isIntersecting) {
          // Left the screen — drop the title with it, but never fade in from
          // nothing on the initial out-of-view callback.
          setPhase((prev) => (prev === "hidden" ? "hidden" : "fading"));
          return;
        }

        setPhase("visible");

        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          setPhase("fading");
        }, duration);
      },
      // Fires when the target crosses the viewport center line. This works for
      // a single full-height section and for a multi-slide group alike, which
      // a ratio threshold cannot do once the target outgrows the viewport.
      { rootMargin: "-50% 0px -50% 0px" },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      clearTimer();
    };
  }, [duration, targetRef]);

  return (
    <>
      <span
        ref={anchorRef}
        className="hidden"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        onTransitionEnd={() => setPhase((prev) => (prev === "fading" ? "hidden" : prev))}
        style={{
          zIndex: 100,
          opacity: phase === "visible" ? 1 : 0,
          transition: phase === "fading" ? "opacity 700ms ease-in-out" : "none",
          display: phase === "hidden" ? "none" : "flex",
        }}
      >
        <img
          loading="lazy"
          decoding="async"
          src={imageSrc}
          alt=""
          aria-hidden="true"
          style={{
            width: imageWidth,
            height: "auto",
            maxWidth: "98vw",
          }}
        />
      </div>
    </>
  );
}
