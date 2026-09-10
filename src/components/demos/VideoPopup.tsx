"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

// No mobile entry on purpose: on a phone the top of the card is the video, and
// a strip of masking tape over it reads as a smudge rather than as tape.
const TAPE_CONFIG: Record<Exclude<Breakpoint, "mobile">, { width: number; height: number }> = {
  tablet: { width: 56, height: 16 },
  desktop: { width: 64, height: 18 },
};

const LINE_H = 28;
const AUTO_ADVANCE_DELAY = 3;

// Overlay padding, in px, per breakpoint: `p-2` on mobile, `p-6` above it.
// The card's max-height is derived from these so the two never drift apart.
const OVERLAY_PAD = { mobile: 16, desktop: 48 } as const;

// Everything the ruled paper spends on height besides the header and the video:
// padding-top (LINE_H * 2), the spacer above the video, the one below it, and
// padding-bottom.
const PAPER_CHROME = LINE_H * 2 + LINE_H + LINE_H + LINE_H;

// On mobile the video is lifted out of the paper and sits above it, so the
// paper only spends its own padding: one line at the top, one at the bottom.
const PAPER_CHROME_MOBILE = LINE_H * 2;

// Floor for the video on very short screens. Below this the paper scrolls
// instead, which is the lesser evil.
const MIN_VIDEO_H = 120;

// Mobile playlist thumbnail width. At 128px the whole item is a ~128x96 target
// and the title survives at 12px — the previous 80px thumb forced a 9.6px
// label, which is below what anyone can read or aim at on a phone.
const MOBILE_THUMB_W = 128;

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
      className={`${large ? "w-12 h-12 active:scale-95" : "w-9 h-9"} shrink-0 rounded-full border border-neutral-300 flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-neutral-500 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed`}
      aria-label={label}
    >
      <svg
        className={large ? "w-6 h-6" : "w-4 h-4"}
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

// Transforms whatever wrapper is passed in. The scroll reset is the caller's
// job: on mobile the animated wrapper and the scrolling paper are two different
// elements, because the video sits outside the paper but must still slide.
function animateIn(el: HTMLDivElement, direction: "left" | "right") {
  const startX = direction === "right" ? 48 : -48;
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
  const slideRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);

  const hasNav = onPrev !== undefined || onNext !== undefined;
  const hasPlaylist = playlist && playlist.length > 1;
  const showSidebarPlaylist = !isMobile && hasPlaylist;
  const showMobilePlaylist = isMobile && hasPlaylist;

  const overlayPad = isMobile ? OVERLAY_PAD.mobile : OVERLAY_PAD.desktop;
  const maxH = `calc(100dvh - ${overlayPad}px)`;

  const [countdown, setCountdown] = useState<number | null>(null);

  // The video block is `aspect-video`, so its height follows its width and
  // ignores the viewport entirely — on a short screen it outgrows the card and
  // the paper scrolls, cutting the video in half. Cap its width by whatever
  // height is actually left over, keeping the 16:9 ratio intact.
  const [videoMaxH, setVideoMaxH] = useState<number | null>(null);

  useLayoutEffect(() => {
    // Measured against the viewport rather than the card: the card is sized by
    // its content, so reading its height here would feed the video's own size
    // back into the calculation.
    const measure = () => {
      const headerH = headerRef.current?.offsetHeight ?? 0;
      const chromeH = chromeRef.current?.offsetHeight ?? 0;
      const paperChrome = isMobile ? PAPER_CHROME_MOBILE : PAPER_CHROME;
      const available =
        window.innerHeight - overlayPad - paperChrome - headerH - chromeH;
      setVideoMaxH(Math.max(available, MIN_VIDEO_H));
    };

    measure();
    window.addEventListener("resize", measure);

    // The header grows when a title wraps, and the chrome grows when the
    // countdown banner or the playlist strip appear.
    const observer = new ResizeObserver(measure);
    if (headerRef.current) observer.observe(headerRef.current);
    if (chromeRef.current) observer.observe(chromeRef.current);

    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [overlayPad, isMobile]);

  const embedOrigin = useState(
    () => (typeof window !== "undefined" ? window.location.origin : "")
  )[0];

  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  const hasNextRef = useRef(hasNext);

  // Assigned in an effect, not during render: a render can be started and then
  // thrown away (StrictMode, a concurrent re-render), and mutating a ref on that
  // discarded pass leaves it holding a value that was never committed. Every
  // reader below runs from a timer or an event handler, i.e. after commit, so
  // updating here is soon enough.
  useEffect(() => {
    onPrevRef.current = onPrev;
    onNextRef.current = onNext;
    hasNextRef.current = hasNext;
  });

  const navDirRef = useRef<"left" | "right">("right");
  const animatingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setCountdown(null);
    if (paperRef.current) paperRef.current.scrollTop = 0;
    const el = slideRef.current;
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
    const el = slideRef.current;
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
  useEffect(() => {
    handleNavRef.current = handleNav;
  });

  // Placed after `handleNavRef` is populated above: this reads it, and a ref has
  // to be written before the effects that consume it.
  //
  // The last tick advances directly instead of parking the state at 0 and
  // reacting to that on the next pass — the old shape spent a render showing
  // "Siguiente en 0s" and then a second one just to clear it. Total wait is
  // unchanged; one tick still lasts a second.
  useEffect(() => {
    if (countdown === null) return;

    const timer = setTimeout(() => {
      if (countdown <= 1) {
        handleNavRef.current("right", onNextRef.current);
        setCountdown(null);
        return;
      }
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

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

  const contentPaddingLeft = isMobile ? "44px" : "clamp(52px, 9vw, 72px)";
  const contentPaddingRight = isMobile ? "12px" : "clamp(16px, 4vw, 28px)";
  const marginLineLeft = isMobile ? "28px" : "clamp(36px, 7vw, 52px)";

  // Once the video is limited by height it stops filling the paper's width, so
  // the card has to narrow with it or the paper is left with dead margins.
  // Derived from the same height budget, so it never disagrees with the video.
  // On mobile the video is no longer inside the paper's padding, so the card
  // takes the full overlay width and this cap does not apply.
  const cardMaxW =
    videoMaxH === null || isMobile
      ? undefined
      : `calc(${Math.round((videoMaxH * 16) / 9)}px + ${contentPaddingLeft} + ${contentPaddingRight})`;

  // The paper's left padding exists to clear the notebook margin line, which is
  // the right call for text but costs the video ~15% of the width on a phone.
  // On mobile the video is therefore hoisted out of the paper and pinned to the
  // top of the card at full width; the paper keeps its margin for the title.
  const videoBlock = (
    <div
      className={`relative aspect-video bg-neutral-900 overflow-hidden mx-auto ${
        isMobile ? "w-full shrink-0" : "rounded-sm shadow-md"
      }`}
      style={
        videoMaxH === null
          ? undefined
          : // Width-driven so `aspect-video` keeps the ratio; the height
            // budget is folded into the width instead of clamping the
            // box, which would letterbox it.
            { width: `min(100%, ${Math.round((videoMaxH * 16) / 9)}px)` }
      }
    >
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
  );

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
        className={`shrink-0 snap-start flex flex-col rounded-sm overflow-hidden transition-all duration-200 ${
          isActive ? "ring-2 ring-text-primary ring-offset-1" : "opacity-55 active:opacity-100"
        }`}
        style={{ width: MOBILE_THUMB_W }}
        aria-current={isActive ? "true" : undefined}
        aria-label={`Ir a: ${item.title}`}
      >
        <div
          className="relative bg-neutral-200"
          style={{ width: MOBILE_THUMB_W, height: Math.round((MOBILE_THUMB_W * 9) / 16) }}
        >
          <img src={getYouTubeThumbnail(item.videoId)} alt="" aria-hidden="true" className="w-full h-full object-cover" />
          {isActive && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
        <p className={`font-heading text-xs leading-snug truncate w-full text-left px-1.5 pt-1.5 pb-2 ${
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
      <div className={`flex gap-3 items-stretch justify-center ${isMobile ? "w-full" : "w-full max-w-6xl"}`}>

        {/* ── Main modal card ─────────────────────────────────────────── */}
        <div
          className="relative flex flex-col bg-white rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex-1 min-w-0"
          style={{ maxHeight: maxH, maxWidth: cardMaxW }}
        >
          {/* Tape — comparing the breakpoint rather than reading `isMobile`
              narrows the type, so TAPE_CONFIG needs no mobile entry. */}
          {breakpoint !== "mobile" && (
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <span
                className="tape-strip block rounded-sm"
                style={{
                  width: TAPE_CONFIG[breakpoint].width,
                  height: TAPE_CONFIG[breakpoint].height,
                  transform: "rotate(-2deg)",
                }}
              />
            </div>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            // On mobile the button now sits over the video, so it carries its
            // own scrim instead of relying on the paper behind it.
            className={`absolute top-2 right-2 z-20 flex items-center justify-center rounded-full transition-colors ${
              isMobile
                ? "w-12 h-12 bg-black/45 text-white active:bg-black/70 active:scale-95"
                : "w-11 h-11 text-text-secondary hover:bg-neutral-100 hover:text-text-primary"
            }`}
            aria-label="Cerrar video"
          >
            <svg className={isMobile ? "w-6 h-6" : "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Slide wrapper — everything that travels during a nav transition */}
          <div ref={slideRef} className="flex-1 min-h-0 flex flex-col">

          {/* Video — above the paper on mobile so it can use the full width */}
          {isMobile && videoBlock}

          {/* Ruled paper */}
          <div
            ref={paperRef}
            className="relative flex-1 overflow-y-auto overscroll-contain"
            style={{
              paddingTop: isMobile ? LINE_H : LINE_H * 2,
              paddingBottom: LINE_H,
              paddingLeft: contentPaddingLeft,
              paddingRight: contentPaddingRight,
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
            <div ref={headerRef}>
              <h3
                // The close button only overlaps the title on desktop; on mobile
                // it floats over the video, so the reserved gutter would just
                // be wasted width on the narrowest screen.
                className={`font-heading text-text-primary font-semibold ${isMobile ? "" : "pr-12"}`}
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
                  style={{ fontSize: isMobile ? "0.7rem" : "0.6rem", lineHeight: `${LINE_H}px` }}
                >
                  {category}
                </p>
              )}
            </div>
            {!isMobile && (
              <>
                <div style={{ height: LINE_H }} aria-hidden="true" />
                {videoBlock}
                <div style={{ height: LINE_H }} aria-hidden="true" />
              </>
            )}
          </div>

          </div>

          {/* Bars below the paper. Always rendered so the ref is stable — the
              height budget above depends on measuring whatever is in here. */}
          <div ref={chromeRef} className="shrink-0">

          {/* Auto-advance countdown banner */}
          {countdown !== null && (
            <div className="border-t border-neutral-100 bg-neutral-50/80 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="h-0.5 bg-neutral-200">
                <div
                  className="h-full bg-text-secondary/50 transition-[width] duration-1000 ease-linear"
                  style={{ width: `${(countdown / AUTO_ADVANCE_DELAY) * 100}%` }}
                />
              </div>
              <div className={`flex items-center justify-between ${isMobile ? "pl-4 pr-1 py-0.5" : "px-4 py-1.5"}`}>
                <span className={`font-body text-text-secondary/50 select-none ${isMobile ? "text-sm" : "text-xs"}`}>
                  Siguiente en {countdown}s
                </span>
                <button
                  type="button"
                  onClick={() => setCountdown(null)}
                  // Padding rather than a bare link: on a phone this is the
                  // escape hatch from an auto-advance already counting down.
                  className={`font-body text-text-secondary/50 hover:text-text-primary transition-colors underline underline-offset-2 decoration-text-secondary/30 ${
                    isMobile ? "text-sm px-4 py-2.5" : "text-xs"
                  }`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Nav bar */}
          {hasNav && (
            <div className={`flex items-center justify-between border-t border-neutral-100 bg-white ${isMobile ? "px-3 py-2.5" : "px-4 py-3"}`}>
              <NavArrow
                direction="left"
                onClick={() => handleNav("left", onPrev)}
                disabled={!hasPrev}
                label="Anterior"
                large={isMobile}
              />
              {navIndex !== undefined && navTotal !== undefined && (
                <span className={`font-body tracking-widest text-text-secondary/40 uppercase select-none ${isMobile ? "text-sm" : "text-xs"}`}>
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
            <div className="border-t border-neutral-100 bg-white">
              <div className="px-3 pt-2 pb-0.5">
                <p className="font-body text-[0.65rem] tracking-widest text-text-secondary/40 uppercase">
                  Playlist
                </p>
              </div>
              <div
                className="overflow-x-auto pt-2 pb-3 snap-x snap-mandatory"
                // Claims horizontal panning so the strip never competes with
                // the page's vertical scroll for the same gesture.
                style={{ touchAction: "pan-x" }}
              >
                <div className="flex gap-2.5 px-3 w-max">
                  {playlist!.map((item, i) => renderMobileItem(item, i))}
                </div>
              </div>
            </div>
          )}

          </div>
        </div>

        {/* ── Desktop playlist sidebar ─────────────────────────────────── */}
        {showSidebarPlaylist && (
          <div
            className="w-72 shrink-0 bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-4 duration-300"
            // Without a cap the sidebar's full list sets the flex line height,
            // dragging the whole row past the viewport once the playlist is
            // long enough. The card alone being capped is not sufficient.
            style={{ maxHeight: maxH }}
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
