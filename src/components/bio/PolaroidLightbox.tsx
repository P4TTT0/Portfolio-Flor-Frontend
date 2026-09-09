"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Where the photo sits on screen when the lightbox opens, so it grows from there. */
export interface PolaroidOrigin {
  centerX: number;
  centerY: number;
  /** On-screen side of the square photo, with the rotation already divided out. */
  size: number;
  rotation: number;
}

interface PolaroidLightboxProps {
  src: string;
  alt: string;
  origin: PolaroidOrigin;
  onClose: () => void;
}

const DURATION = 420;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const MAX_SIZE = 560;
const VIEWPORT_FRACTION = 0.8;

/**
 * Full-screen view of the bio polaroid.
 *
 * Portalled to `document.body` because BioCard scales its container, and a
 * `position: fixed` child of a transformed ancestor resolves against that
 * ancestor instead of the viewport — it would never reach the screen edges.
 *
 * The growth is a FLIP: the image is laid out at its FINAL size and centred,
 * then a transform pushes it back onto the polaroid for one frame before the
 * transition runs. Only `transform` and `opacity` animate, so the browser can
 * keep the whole thing on the compositor instead of relaying out (and
 * repainting the shadow) on every frame.
 */
export default function PolaroidLightbox({
  src,
  alt,
  origin,
  onClose,
}: PolaroidLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));
  const [reducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const duration = reducedMotion ? 0 : DURATION;

  // Two frames, not one: a single rAF can still be batched into the paint that
  // mounts the element, which would skip the start state and pop the image
  // straight to its final position with no animation.
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setOpen(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  useEffect(() => {
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Play the growth backwards, then unmount once it has landed. The guard stops
  // a second dismissal (backdrop, close button, Escape) from queueing another
  // unmount while the first one is still running.
  const closing = useRef(false);
  const handleClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setOpen(false);
    window.setTimeout(onClose, duration);
  }, [duration, onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose]);

  const finalSize = Math.min(
    viewport.w * VIEWPORT_FRACTION,
    viewport.h * VIEWPORT_FRACTION,
    MAX_SIZE,
  );

  // Offsets from the centred final box back to the polaroid. They sit after the
  // `translate(-50%, -50%)` in the list, so they stay plain pixels and are not
  // multiplied by the scale that follows them.
  const dx = origin.centerX - viewport.w / 2;
  const dy = origin.centerY - viewport.h / 2;
  const startScale = origin.size / finalSize;

  // Both states list the same four functions so the browser interpolates them
  // one by one instead of decomposing a matrix.
  const transform = open
    ? "translate(-50%, -50%) translate(0px, 0px) scale(1) rotate(0deg)"
    : `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${startScale}) rotate(${origin.rotation}deg)`;

  const modal = (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      style={{
        opacity: open ? 1 : 0,
        transition: `opacity ${duration}ms ease`,
      }}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Cerrar foto"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <img
        src={src}
        alt={alt}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: finalSize,
          aspectRatio: "1 / 1",
          objectFit: "cover",
          borderRadius: 3,
          boxShadow: "rgba(0, 0, 0, 0.45) 0 12px 40px",
          transform,
          transition: `transform ${duration}ms ${EASE}`,
          willChange: "transform",
        }}
      />
    </div>
  );

  return createPortal(modal, document.body);
}
