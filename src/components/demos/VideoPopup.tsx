"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getYouTubeEmbedUrl } from "@/lib/youtube-utils";
import useBreakpoint, { type Breakpoint } from "@/hooks/useBreakpoint";

interface VideoPopupProps {
  videoId: string;
  title: string;
  category: string;
  onClose: () => void;
}

// Tape dimensions by breakpoint (sm/md/lg: width × height)
const TAPE_CONFIG: Record<Breakpoint, { width: number; height: number }> = {
  mobile: { width: 48, height: 14 },
  tablet: { width: 56, height: 16 },
  desktop: { width: 64, height: 18 },
};

export default function VideoPopup({ videoId, title, category, onClose }: VideoPopupProps) {
  const { breakpoint, isMobile } = useBreakpoint();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Close on overlay click (not on notebook)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const tape = TAPE_CONFIG[breakpoint];

  const modal = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Video: ${title}`}
    >
      {/* Notebook paper */}
      <div className={`relative bg-white rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 ${
        isMobile ? "w-full max-w-full" : "w-full max-w-5xl"
      }`}>
        {/* Tape at the top — responsive size */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10">
          <span
            className="tape-strip block rounded-sm"
            style={{
              width: tape.width,
              height: tape.height,
              transform: "rotate(-2deg)",
            }}
          />
        </div>

        {/* Notebook header — responsive typography */}
        <div className="relative px-6 pt-5 pb-3 border-b border-neutral-200">
          <h3 className="font-heading text-lg sm:text-xl lg:text-2xl text-text-primary font-semibold">
            {title}
          </h3>
          {category && (
            <p className="font-body text-xs sm:text-sm text-text-secondary/70 uppercase tracking-wider mt-1">
              {category}
            </p>
          )}

          {/* Close button — minimum 44×44px touch target */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-text-secondary hover:text-text-primary"
            aria-label="Cerrar video"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Notebook lines */}
        <div className="relative px-6 py-4">
          {/* Ruled lines background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                to bottom,
                transparent,
                transparent 27px,
                #e5e7eb 27px,
                #e5e7eb 28px
              )`,
              backgroundPositionY: "48px",
            }}
            aria-hidden="true"
          />

          {/* Red margin line — responsive position */}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-300/40"
            style={{ left: "clamp(24px, 8vw, 56px)" }}
            aria-hidden="true"
          />

          {/* Video embed */}
          <div className="relative aspect-video bg-neutral-900 rounded-sm overflow-hidden shadow-lg">
            <iframe
              src={getYouTubeEmbedUrl(videoId)}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render via portal to escape the rotated pizarra context
  return createPortal(modal, document.body);
}
