"use client";

interface BioCardProps {
  bio: string;
  picture?: string | null;
}

/**
 * BioCard — scrapbook composition with paper, stars, and polaroid.
 *
 * Visual layers:
 *  1. paper.png — large, slightly rotated left, bio text centered on it
 *  2. stars.png — between paper and polaroid, slightly rotated
 *  3. Profile photo — behind polaroid frame
 *  4. Polaroid frame — bottom-right, protruding outside folder
 *  5. Paper clip — bottom-right edge
 *
 * Assets: /assets/elements/paper.png, stars.png, polaroid-frame.png, clip.png
 */
export default function BioCard({ bio, picture }: BioCardProps) {
  return (
    <div className="relative w-full flex-1 min-h-0 overflow-visible" style={{height: "80%"}}>
      {/* ── Paper background — large, slightly rotated left, text centered ── */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          zIndex: 40,
          left: "-2%",
          top: "-8%",
          width: "100%",
          height: "125%",
          transform: "rotate(-3deg)",
          transformOrigin: "center center",
        }}
      >
        <img
          src="/assets/elements/paper.png"
          alt=""
          className="w-full h-full object-contain pointer-events-none"
          aria-hidden="true"
          style={{
            opacity: 0.7,
          }}
        />

        {/* Bio text — vertically centered, left-aligned with padding */}
        <div
          className="absolute flex items-start justify-start"
          style={{
            inset: "15% 21% 19% 20%",
          }}
        >
          <p
            className="font-body whitespace-pre-line"
            style={{
              color: "rgb(94, 94, 94)",
              lineHeight: "1.9",
              fontSize: "17px",
              textAlign: "justify",
            }}
          >
            {bio}
          </p>
        </div>
      </div>

      {/* ── Stars — between paper and polaroid ── */}
      <img
        src="/assets/elements/stars.png"
        alt=""
        className="absolute pointer-events-none"
        style={{
          zIndex: 52,
          right: "27%",
          bottom: "31%",
          width: "18%",
          maxWidth: "100px",
          transform: "rotate(-26deg)",
          filter: "drop-shadow(rgba(0, 0, 0, 0.15) 1px 2px 3px)",
        }}
        aria-hidden="true"
      />

      {/* ── Profile photo — behind polaroid frame ── */}
      {picture && (
        <img
          src={picture}
          alt="Foto de perfil"
          className="absolute object-cover rounded-sm"
          style={{
            zIndex: 49,
            right: "14%",
            bottom: "4%",
            width: "24%",
            maxWidth: "167px",
            aspectRatio: "1 / 1",
            transform: "rotate(8deg)",
            boxShadow: "rgba(0, 0, 0, 0.1) 1px 2px 4px",
          }}
        />
      )}

      {/* ── Polaroid frame — bottom-right, protrudes outside folder ── */}
      <img
        src="/assets/elements/polaroid-frame.png"
        alt=""
        className="absolute pointer-events-none"
        style={{
          zIndex: 50,
          right: "13%",
          bottom: "-8%",
          width: "29%",
          maxWidth: "180px",
          transform: "rotate(8deg)",
          filter: "drop-shadow(rgba(0, 0, 0, 0.15) 2px 4px 8px)",
        }}
        aria-hidden="true"
      />

      {/* ── Paper clip — bottom-right edge ── */}
      <img
        src="/assets/elements/clip.png"
        alt=""
        className="absolute pointer-events-none"
        style={{
          zIndex: 60,
          right: "13%",
          bottom: "32%",
          width: "10%",
          maxWidth: "50px",
          transform: "rotate(15deg)",
          filter: "drop-shadow(rgba(0, 0, 0, 0.15) 1px 2px 3px)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
