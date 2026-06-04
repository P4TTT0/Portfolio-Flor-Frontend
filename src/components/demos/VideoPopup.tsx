"use client";

import { useEffect, useRef } from "react";
import { getYouTubeEmbedUrl } from "@/lib/youtube-utils";

interface VideoPopupProps {
  videoId: string;
  title: string;
  category: string;
  onClose: () => void;
}

export default function VideoPopup({ videoId, title, category, onClose }: VideoPopupProps) {
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

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Video: ${title}`}
    >
      {/* Notebook paper */}
      <div className="relative w-full max-w-2xl bg-white rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Tape at the top */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10">
          <span
            className="tape-strip block rounded-sm"
            style={{ width: "56px", height: "16px", transform: "rotate(-2deg)" }}
          />
        </div>

        {/* Notebook header */}
        <div className="relative px-6 pt-5 pb-3 border-b border-neutral-200">
          <h3 className="font-heading text-xl sm:text-2xl text-text-primary font-semibold">
            {title}
          </h3>
          {category && (
            <p className="font-body text-xs sm:text-sm text-text-secondary/70 uppercase tracking-wider mt-1">
              {category}
            </p>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-text-secondary hover:text-text-primary"
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

          {/* Red margin line */}
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
}
