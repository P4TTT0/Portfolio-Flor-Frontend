"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import WorksGalleryGrid from "@/components/works/WorksGalleryGrid";
import VideoPopup from "@/components/demos/VideoPopup";
import { extractYouTubeId } from "@/lib/youtube-utils";
import type { WorkItem } from "@/lib/use-sanity-content";

interface WorksGalleryModalProps {
  works: WorkItem[];
  onClose: () => void;
}

export default function WorksGalleryModal({ works, onClose }: WorksGalleryModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedIndex !== null) {
          setSelectedIndex(null); // close video first, stay in gallery
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, selectedIndex]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const modal = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Galería de trabajos"
    >
      {/*
        Fixed height, not `max-h`: with only a few works a content-sized panel
        would grow every time the hover expansion made a row taller, so the
        whole dialog breathed along with the animation. Pinning it hands that
        growth to the scroll area below instead.
      */}
      <div className="relative bg-cream rounded-sm shadow-2xl w-full max-w-6xl h-[90dvh] flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="shrink-0 border-b border-text-primary/10 px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading text-xl sm:text-2xl text-text-primary">
            Todos los trabajos
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-text-secondary hover:text-text-primary"
            aria-label="Cerrar galería"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/*
          Owns all the leftover height. The padding is also what a scaled tile
          on the outer edge of the grid grows into before this container's
          overflow clips it.
        */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-10">
          <WorksGalleryGrid works={works} onPlay={setSelectedIndex} />
        </div>
      </div>
    </div>
  );

  // VideoPopup for the selected work — renders on top of the gallery
  const videoPopup = (() => {
    if (selectedIndex === null) return null;
    const work = works[selectedIndex];
    if (!work) return null;
    const videoId = extractYouTubeId(work.youtubeUrl);
    if (!videoId) return null;
    const playlist = works
      .map((w) => ({ title: w.title, category: w.category ?? "", videoId: extractYouTubeId(w.youtubeUrl) ?? "" }))
      .filter((item) => item.videoId !== "");
    return (
      <VideoPopup
        videoId={videoId}
        title={work.title}
        category={work.category}
        onClose={() => setSelectedIndex(null)}
        onPrev={selectedIndex > 0 ? () => setSelectedIndex((i) => i! - 1) : undefined}
        onNext={selectedIndex < works.length - 1 ? () => setSelectedIndex((i) => i! + 1) : undefined}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < works.length - 1}
        navIndex={selectedIndex}
        navTotal={works.length}
        playlist={playlist}
        onNavigateTo={(i) => setSelectedIndex(i)}
      />
    );
  })();

  return (
    <>
      {createPortal(modal, document.body)}
      {videoPopup}
    </>
  );
}
