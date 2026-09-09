"use client";

import { useEffect, useRef, useState } from "react";
import PolaroidLightbox, {
  type PolaroidOrigin,
} from "@/components/bio/PolaroidLightbox";

interface BioCardProps {
  bio: string;
  picture?: string | null;
}

const DESIGN_WIDTH = 600;
const DESIGN_HEIGHT = 500;

/** Tilt of the profile photo, shared with the lightbox so it grows from the same angle. */
const PHOTO_ROTATION = 8;

/**
 * Hover state of the polaroid: it straightens a touch and lifts off the page.
 *
 * The tilt is a DELTA applied to the group wrapper, not an absolute angle on
 * each piece. Photo, frame and clip are separate elements rotating about their
 * own centres, so a per-element rotation pulls them apart by
 * `distance from the pivot * delta`: 0.78px for the frame at 2deg, but 3.6px
 * for the clip, which sits ~105px out — and the card scales up to 1.8x on
 * desktop, so that lands near 6.5px on screen. Turning one wrapper about a
 * single pivot keeps the group rigid at any angle.
 */
const PHOTO_HOVER_TILT = -2;
const PHOTO_HOVER_LIFT = -8;
const PHOTO_TRANSITION =
  "transform 260ms cubic-bezier(0.22, 1, 0.36, 1), filter 260ms ease";

export default function BioCard({ bio, picture }: BioCardProps) {
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLButtonElement>(null);
  const [lightboxOrigin, setLightboxOrigin] = useState<PolaroidOrigin | null>(
    null,
  );
  const [photoHovered, setPhotoHovered] = useState(false);

  // The design box is a fixed 600x500, so the right-anchored offsets the photo
  // was authored with convert to plain left offsets losslessly. Deriving the
  // pivot from these same values is the point: a copied pair of coordinates
  // would silently fall out of sync the first time the photo is nudged.
  const photoSize = isMobile ? 217 : isTablet ? 218 : 220;
  const photoLeft = isMobile
    ? DESIGN_WIDTH - 9 - photoSize
    : isTablet
      ? DESIGN_WIDTH + 54 - photoSize
      : 494;
  const photoBottom = isMobile ? -58 : isTablet ? -9 : 10;

  const pivotX = photoLeft + photoSize / 2;
  const pivotY = DESIGN_HEIGHT - photoBottom - photoSize / 2;

  // What the photo is actually rotated by on screen: its own tilt plus the
  // group delta. The lightbox reads this so its FLIP starts from the real angle.
  const photoRotation = PHOTO_ROTATION + (photoHovered ? PHOTO_HOVER_TILT : 0);
  const groupTransform = `translateY(${photoHovered ? PHOTO_HOVER_LIFT : 0}px) rotate(${
    photoHovered ? PHOTO_HOVER_TILT : 0
  }deg)`;

  const openLightbox = () => {
    const el = photoRef.current;
    if (!el) return;

    // getBoundingClientRect measures the axis-aligned box around the ROTATED
    // square, which is wider than the photo itself. For a square turned by t
    // that box is side * (|cos t| + |sin t|), so dividing the factor back out
    // recovers the on-screen side the lightbox has to grow from. The ancestor
    // `scale()` is already baked into the rect, which is what we want.
    const rad = (photoRotation * Math.PI) / 180;
    const rect = el.getBoundingClientRect();
    const size = rect.width / (Math.abs(Math.cos(rad)) + Math.abs(Math.sin(rad)));

    setLightboxOrigin({
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      size,
      rotation: photoRotation,
    });
  };

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el?.parentElement) return;

    const updateScale = () => {
      const parent = el.parentElement!;
      const width = window.innerWidth;
      const scaleX = parent.clientWidth / DESIGN_WIDTH;
      const scaleY = parent.clientHeight / DESIGN_HEIGHT;
      // In desktop (>1024px), allow scaling up to fill the space
      const maxScale = width < 1024 ? 1 : 1.8;
      setScale(Math.min(scaleX, scaleY, maxScale));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el.parentElement);
    window.addEventListener("resize", updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <>
    <div className="relative w-full flex-1 min-h-0 overflow-visible" style={{ height: "80%" }}>
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          marginLeft: -DESIGN_WIDTH / 2,
          marginTop: -DESIGN_HEIGHT / 2,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: isMobile ? -80 : isTablet ? -50 : undefined,
            right: !isMobile && !isTablet ? -80 : undefined,
            top: isMobile ? -100 : isTablet ? -115 : -120,
            width: isMobile ? 760 : isTablet ? 700 : 750,
            height: isMobile ? 700 : isTablet ? 670 : 670,
            transform: isMobile ? "rotate(87deg)" : "rotate(-3deg)",
            transformOrigin: "center center",
            zIndex: 40,
          }}
        >
          <img
            src="/assets/elements/paper.png"
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              opacity: 0.7,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: isMobile ? 35 : isTablet ? 137 : 120,
              right: isMobile ? 176 : isTablet ? 71 : 80,
              bottom: isMobile ? 35 : isTablet ? 137 : 120,
              left: isMobile ? 176 : isTablet ? 71 : 80,
              transform: isMobile ? "rotate(-90deg)" : "none",
              transformOrigin: "center center",
            }}
          >
            <p
              className="font-body"
              style={{
                whiteSpace: "pre-line",
                fontSize: isMobile ? 25 : isTablet ? 25 : 26,
                lineHeight: 1.9,
                color: "rgb(94, 94, 94)",
                textAlign: "justify",
                margin: 0,
              }}
            >
              {bio}
            </p>
          </div>
        </div>

        <img
          src="/assets/elements/stars.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            right: isMobile ? 332 : isTablet ? 193 : 172,
            bottom: isMobile ? -35 : isTablet ? 107 : 100,
            width: isMobile ? 142 : isTablet ? 125 : 136,
            zIndex: 52,
            pointerEvents: "none",
            transform: "rotate(-26deg)",
            filter: "drop-shadow(rgba(0, 0, 0, 0.15) 1px 2px 3px)",
          }}
        />

        {/*
          Photo, frame and clip are one physical object, so they move as one.
          The wrapper spans the whole design box, which means the children keep
          the exact absolute coordinates they were authored with; only the pivot
          moves to the photo's centre.

          It has to opt out of hit testing — it covers the paper and the bio text
          too — and the button opts back in. The frame and clip already do.
        */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 49,
            pointerEvents: "none",
            transformOrigin: `${pivotX}px ${pivotY}px`,
            transform: groupTransform,
            transition: PHOTO_TRANSITION,
          }}
        >
        {picture && (
          <button
            ref={photoRef}
            type="button"
            onClick={openLightbox}
            onMouseEnter={() => setPhotoHovered(true)}
            onMouseLeave={() => setPhotoHovered(false)}
            onFocus={() => setPhotoHovered(true)}
            onBlur={() => setPhotoHovered(false)}
            aria-label="Ver la foto en grande"
            style={{
              position: "absolute",
              right: isMobile ? 9 : isTablet ? -54 : undefined,
              left: !isMobile && !isTablet ? 494 : undefined,
              bottom: isMobile ? -58 : isTablet ? -9 : 10,
              width: isMobile ? 217 : isTablet ? 218 : 220,
              aspectRatio: "1 / 1",
              padding: 0,
              border: "none",
              background: "none",
              borderRadius: 2,
              zIndex: 49,
              pointerEvents: "auto",
              transform: `rotate(${PHOTO_ROTATION}deg)`,
              boxShadow: "rgba(0, 0, 0, 0.1) 1px 2px 4px",
              filter: photoHovered ? "brightness(1.06)" : "brightness(1)",
              transition: PHOTO_TRANSITION,
            }}
          >
            <img
              src={picture}
              alt="Foto de perfil"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
          </button>
        )}

        <img
          src="/assets/elements/polaroid-frame.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            right: isMobile ? 2 : isTablet ? -64 : undefined,
            left: !isMobile && !isTablet ? 482 : undefined,
            bottom: isMobile ? -117 : isTablet ? -69 : -47,
            width: isMobile ? 236 : isTablet ? 243 : 238,
            zIndex: 50,
            pointerEvents: "none",
            // The frame carries the visible shadow — the photo's own is hidden
            // behind it — so the depth cue on hover lives here.
            transform: `rotate(${PHOTO_ROTATION}deg)`,
            filter: photoHovered
              ? "drop-shadow(rgba(0, 0, 0, 0.22) 4px 10px 16px)"
              : "drop-shadow(rgba(0, 0, 0, 0.15) 2px 4px 8px)",
            transition: PHOTO_TRANSITION,
          }}
        />

        <img
          src="/assets/elements/clip.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            right: isMobile ? 17 : isTablet ? -47 : -94,
            bottom: isMobile ? 72 : isTablet ? 123 : 148,
            width: isMobile ? 65 : isTablet ? 71 : 62,
            zIndex: 60,
            pointerEvents: "none",
            transform: isMobile ? "rotate(10deg)" : isTablet ? "rotate(15deg)" : "rotate(9deg)",
            filter: photoHovered
              ? "drop-shadow(rgba(0, 0, 0, 0.22) 2px 5px 7px)"
              : "drop-shadow(rgba(0, 0, 0, 0.15) 1px 2px 3px)",
            transition: PHOTO_TRANSITION,
          }}
        />
        </div>
      </div>
    </div>

    {picture && lightboxOrigin && (
      <PolaroidLightbox
        src={picture}
        alt="Foto de perfil"
        origin={lightboxOrigin}
        onClose={() => setLightboxOrigin(null)}
      />
    )}
    </>
  );
}
