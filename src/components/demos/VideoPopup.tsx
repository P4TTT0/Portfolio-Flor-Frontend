"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/lib/youtube-utils";
import useBreakpoint, { type Breakpoint } from "@/hooks/useBreakpoint";

export interface PlaylistItem {
  title: string;
  category: string;
  videoId: string;
}

interface VideoPopupProps {
  videoId: string;
  title: string;
  category: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  navIndex?: number;
  navTotal?: number;
  playlist?: PlaylistItem[];
  onNavigateTo?: (index: number) => void;
}

const TAPE_CONFIG: Record<Breakpoint, { width: number; height: number }> = {
  mobile: { width: 48, height: 14 },
  tablet: { width: 56, height: 16 },
  desktop: { width: 64, height: 18 },
};

const LINE_H = 28;
const AUTO_ADVANCE_DELAY = 3;

function NavArrow({
  direction,
  onClick,
  disabled,
  label,
  large,
}: {
  direction: "left" | "right";
  onClick?: () => void;
  disabled?: boolean;
  label: string;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${large ? "w-11 h-11" : "w-9 h-9"} rounded-full border border-neutral-300 flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-neutral-500 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed`}
      aria-label={label}
    >
      <svg
        className={large ? "w-5 h-5" : "w-4 h-4"}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "left" ? (
          <path d="M15 18l-6-6 6-6" />
        ) : (
          <path d="M9 18l6-6-6-6" />
        )}
      </svg>
    </button>
  );
}

function animateIn(el: HTMLDivElement, direction: "left" | "right") {
  const startX = direction === "right" ? 48 : -48;
  el.scrollTop = 0;
  el.style.transition = "none";
  el.style.transform = `translateX(${startX}px)`;
  el.style.opacity = "0";
  void el.offsetHeight;
  el.style.transition =
    "transform 240ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 200ms ease-out";
  el.style.transform = "translateX(0)";
  el.style.opacity = "1";
}

export default function VideoPopup({
  videoId,
  title,
  category,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  navIndex,
  navTotal,
  playlist,
  onNavigateTo,
}: VideoPopupProps) {
  const { breakpoint, isMobile } = useBreakpoint();
  const overlayRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  const hasNav = onPrev !== undefined || onNext !== undefined;
  const hasPlaylist = playlist && playlist.length > 1;
  const showSidebarPlaylist = !isMobile && hasPlaylist;
  const showMobilePlaylist = isMobile && hasPlaylist;

  const maxH = isMobile ? "calc(100dvh - 1rem)" : "calc(100dvh - 3rem)";

  const [countdown, setCountdown] = useState<number | null>(null);

  const embedOrigin = useState(
    () => (typeof window !== "undefined" ? window.location.origin : "")
  )[0];

  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  const hasNextRef = useRef(hasNext);
  onPrevRef.current = onPrev;
  onNextRef.current = onNext;
  hasNextRef.current = hasNext;

  const navDirRef = useRef<"left" | "right">("right");
  const animatingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setCountdown(null);
    const el = paperRef.current;
    if (el) animateIn(el, navDirRef.current);
  }, [videoId]);

  // Works for both vertical (sidebar) and horizontal (mobile strip) scroll containers
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, [navIndex]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      handleNavRef.current("right", onNextRef.current);
      setCountdown(null);
      return;
    }
    const timer = setTimeout(
      () => setCountdown((c) => (c !== null && c > 0 ? c - 1 : null)),
      1000
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const subscribeToYTEvents = () => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
      "https://www.youtube.com"
    );
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.origin.includes("youtube.com")) return;
      let data: Record<string, unknown> | null = null;
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (!data) return;

      let playerState: number | null = null;
      if (data.event === "onStateChange" && typeof data.info === "number") {
        playerState = data.info;
      } else if (
        data.event === "infoDelivery" &&
        typeof (data.info as Record<string, unknown>)?.playerState === "number"
      ) {
        playerState = (data.info as Record<string, unknown>).playerState as number;
      }

      if (playerState === 0 && hasNextRef.current) {
        setCountdown(AUTO_ADVANCE_DELAY);
      } else if (playerState === 1) {
        setCountdown(null);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleNav = (direction: "left" | "right", callback?: () => void) => {
    if (!callback || animatingRef.current) return;
    setCountdown(null);
    const el = paperRef.current;
    if (!el) {
      callback();
      return;
    }
    iframeRef.current?.contentWindow?.postMessage(
      '{"event":"command","func":"pauseVideo","args":""}',
      "https://www.youtube.com"
    );
    animatingRef.current = true;
    navDirRef.current = direction;
    const exitX = direction === "right" ? -48 : 48;
    el.style.transition = "transform 170ms ease-in, opacity 140ms ease-in";
    el.style.transform = `translateX(${exitX}px)`;
    el.style.opacity = "0";
    setTimeout(() => {
      callback();
      setTimeout(() => { animatingRef.current = false; }, 280);
    }, 170);
  };

  const handleNavRef = useRef(handleNav);
  handleNavRef.current = handleNav;

  const handlePlaylistClick = (targetIndex: number) => {
    if (targetIndex === navIndex || !onNavigateTo) return;
    const dir = targetIndex > (navIndex ?? 0) ? "right" : "left";
    handleNav(dir, () => onNavigateTo(targetIndex));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handleNavRef.current("left", onPrevRef.current);
      if (e.key === "ArrowRight") handleNavRef.current("right", onNextRef.current);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const tape = TAPE_CONFIG[breakpoint];
  const contentPaddingLeft = isMobile ? "44px" : "clamp(52px, 9vw, 72px)";
  const marginLineLeft = isMobile ? "28px" : "clamp(36px, 7vw, 52px)";

  // ── Shared playlist item renderer ──────────────────────────────────────────
  const renderSidebarItem = (item: PlaylistItem, i: number) => {
    const isActive = i === navIndex;
    return (
      <button
        key={item.videoId + i}
        ref={isActive ? activeItemRef : null}
        type="button"
        onClick={() => handlePlaylistClick(i)}
        disabled={isActive}
        className={`w-full text-left flex gap-3 items-start px-3 py-2.5 border-l-2 transition-colors ${
          isActive
            ? "bg-neutral-50 border-text-primary cursor-default"
            : "border-transparent hover:bg-neutral-50 hover:border-neutral-300"
        }`}
        aria-current={isActive ? "true" : undefined}
        aria-label={`Ir a: ${item.title}`}
      >
        <div className="relative w-24 shrink-0 rounded-sm overflow-hidden bg-neutral-200" style={{ aspectRatio: "16/9" }}>
          <img src={getYouTubeThumbnail(item.videoId)} alt="" aria-hidden="true" className="w-full h-full object-cover" />
          {isActive && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-white drop-shadow" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0 pt-0.5">
          <p className={`font-heading text-sm leading-tight truncate ${isActive ? "text-text-primary font-semibold" : "text-text-primary/80"}`}>
            {item.title}
          </p>
          {item.category && (
            <p className="font-body text-xs text-text-secondary/40 uppercase tracking-wider mt-1 truncate">
              {item.category}
            </p>
          )}
        </div>
      </button>
    );
  };

  const renderMobileItem = (item: PlaylistItem, i: number) => {
    const isActive = i === navIndex;
    return (
      <button
        key={item.videoId + i}
        ref={isActive ? activeItemRef : null}
        type="button"
        onClick={() => handlePlaylistClick(i)}
        disabled={isActive}
        className={`shrink-0 flex flex-col rounded-sm overflow-hidden transition-all duration-200 ${
          isActive ? "ring-2 ring-text-primary ring-offset-1" : "opacity-55 hover:opacity-90"
        }`}
        style={{ width: 80 }}
        aria-current={isActive ? "true" : undefined}
        aria-label={`Ir a: ${item.title}`}
      >
        <div className="relative bg-neutral-200" style={{ width: 80, height: 45 }}>
          <img src={getYouTubeThumbnail(item.videoId)} alt="" aria-hidden="true" className="w-full h-full object-cover" />
          {isActive && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
        <p className={`font-heading text-[0.6rem] leading-tight truncate w-full text-left px-1 pt-1 pb-1.5 ${
          isActive ? "text-text-primary" : "text-text-primary/70"
        }`}>
          {item.title}
        </p>
      </button>
    );
  };

  const modal = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${
        isMobile ? "p-2" : "p-4 sm:p-6"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`Video: ${title}`}
    >
      <div className={`flex gap-3 items-stretch ${isMobile ? "w-full" : "w-full max-w-6xl"}`}>

        {/* ── Main modal card ─────────────────────────────────────────── */}
        <div
          className="relative flex flex-col bg-white rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex-1 min-w-0"
          style={{ maxHeight: maxH }}
        >
          {/* Tape */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span
              className="tape-strip block rounded-sm"
              style={{ width: tape.width, height: tape.height, transform: "rotate(-2deg)" }}
            />
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-2 right-2 z-20 ${isMobile ? "w-11 h-11" : "w-11 h-11"} flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-text-secondary hover:text-text-primary`}
            aria-label="Cerrar video"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Ruled paper */}
          <div
            ref={paperRef}
            className="relative flex-1 overflow-y-auto"
            style={{
              paddingTop: LINE_H * 2,
              paddingBottom: LINE_H,
              paddingLeft: contentPaddingLeft,
              paddingRight: isMobile ? "12px" : "clamp(16px, 4vw, 28px)",
              backgroundImage: `repeating-linear-gradient(
                to bottom,
                transparent,
                transparent ${LINE_H - 1}px,
                #e5e7eb ${LINE_H - 1}px,
                #e5e7eb ${LINE_H}px
              )`,
            }}
          >
            <div
              className="absolute top-0 bottom-0 w-px bg-red-300/50"
              style={{ left: marginLineLeft }}
              aria-hidden="true"
            />
            <h3
              className="font-heading text-text-primary font-semibold pr-12"
              style={{
                fontSize: isMobile ? "1rem" : "clamp(0.95rem, 2vw, 1.2rem)",
                lineHeight: `${LINE_H}px`,
              }}
            >
              {title}
            </h3>
            {category && (
              <p
                className="font-body text-text-secondary/60 uppercase tracking-widest"
                style={{ fontSize: "0.6rem", lineHeight: `${LINE_H}px` }}
              >
                {category}
              </p>
            )}
            <div style={{ height: LINE_H }} aria-hidden="true" />
            <div className="relative aspect-video bg-neutral-900 rounded-sm overflow-hidden shadow-md">
              <iframe
                ref={iframeRef}
                src={`${getYouTubeEmbedUrl(videoId)}${embedOrigin ? `&origin=${encodeURIComponent(embedOrigin)}` : ""}`}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={subscribeToYTEvents}
              />
            </div>
            <div style={{ height: LINE_H }} aria-hidden="true" />
          </div>

          {/* Auto-advance countdown banner */}
          {countdown !== null && (
            <div className="shrink-0 border-t border-neutral-100 bg-neutral-50/80 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="h-0.5 bg-neutral-200">
                <div
                  className="h-full bg-text-secondary/50 transition-[width] duration-1000 ease-linear"
                  style={{ width: `${(countdown / AUTO_ADVANCE_DELAY) * 100}%` }}
                />
              </div>
              <div className="px-4 py-1.5 flex items-center justify-between">
                <span className="font-body text-xs text-text-secondary/50 select-none">
                  Siguiente en {countdown}s
                </span>
                <button
                  type="button"
                  onClick={() => setCountdown(null)}
                  className="font-body text-xs text-text-secondary/50 hover:text-text-primary transition-colors underline underline-offset-2 decoration-text-secondary/30"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Nav bar */}
          {hasNav && (
            <div className="shrink-0 px-4 py-3 flex items-center justify-between border-t border-neutral-100 bg-white">
              <NavArrow
                direction="left"
                onClick={() => handleNav("left", onPrev)}
                disabled={!hasPrev}
                label="Anterior"
                large={isMobile}
              />
              {navIndex !== undefined && navTotal !== undefined && (
                <span className="font-body text-xs tracking-widest text-text-secondary/40 uppercase select-none">
                  {navIndex + 1} / {navTotal}
                </span>
              )}
              <NavArrow
                direction="right"
                onClick={() => handleNav("right", onNext)}
                disabled={!hasNext}
                label="Siguiente"
                large={isMobile}
              />
            </div>
          )}

          {/* Mobile playlist — horizontal scroll strip inside the card */}
          {showMobilePlaylist && (
            <div className="shrink-0 border-t border-neutral-100 bg-white">
              <div className="px-3 pt-2 pb-0.5">
                <p className="font-body text-[0.55rem] tracking-widest text-text-secondary/40 uppercase">
                  Playlist
                </p>
              </div>
              <div className="overflow-x-auto pt-2 pb-3">
                <div className="flex gap-2 px-3 w-max">
                  {playlist!.map((item, i) => renderMobileItem(item, i))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Desktop playlist sidebar ─────────────────────────────────── */}
        {showSidebarPlaylist && (
          <div
            className="w-72 shrink-0 bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <div className="shrink-0 px-4 py-3 border-b border-neutral-100">
              <p className="font-body text-[0.6rem] tracking-widest text-text-secondary/40 uppercase">
                Playlist
              </p>
            </div>
            <div className="overflow-y-auto flex-1">
              {playlist!.map((item, i) => renderSidebarItem(item, i))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
