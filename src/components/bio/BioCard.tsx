"use client";

interface BioCardProps {
  bio: string;
  picture?: string | null;
}

/**
 * BioCard — CSS-only scrapbook composition with 7 layered elements.
 *
 * Visual clusters:
 *  1. Paper stack at top-left held by bulldog clip (z-10 to z-20)
 *  2. Polaroid frame with profile photo at bottom-right attached by paper clip (z-25 to z-30)
 *
 * Only the bio text scrolls (bio-paper-scroll); all decorative elements
 * remain fixed so they protrude outside the folder body naturally.
 *
 * Assets: /assets/elements/bulldog-clip.png, polaroid-frame.png, clip.png
 */
export default function BioCard({ bio, picture }: BioCardProps) {
  return (
    <div className="relative w-full flex-1 min-h-0 overflow-visible">
      {/* ── Back paper top (protrudes above bio paper) ── */}
      <div
        className="absolute"
        style={{
          zIndex: 10,
          left: "6%",
          top: "4%",
          width: "62%",
          height: "62%",
          background: "linear-gradient(135deg, #F5F2EB 0%, #EDE6D8 100%)",
          transform: "rotate(2deg)",
          transformOrigin: "top left",
          boxShadow: "2px 3px 10px rgba(0,0,0,0.12)",
        }}
        aria-hidden="true"
      />

      {/* ── Back paper bottom (protrudes below bio paper) ── */}
      <div
        className="absolute"
        style={{
          zIndex: 10,
          left: "4%",
          top: "12%",
          width: "62%",
          height: "62%",
          background: "linear-gradient(135deg, #F0EBDF 0%, #E8E0D0 100%)",
          transform: "rotate(-1.5deg)",
          transformOrigin: "top left",
          boxShadow: "2px 3px 10px rgba(0,0,0,0.10)",
        }}
        aria-hidden="true"
      />

      {/* ── Bio paper (ruled sheet, top layer of paper stack) ── */}
      {/* Ruled lines: repeating-linear-gradient (28px step) + red margin line + paper base */}
      <div
        className="absolute flex flex-col"
        style={{
          zIndex: 15,
          left: "5%",
          top: "8%",
          width: "65%",
          maxHeight: "70%",
          transform: "rotate(-0.5deg)",
          transformOrigin: "top left",
          boxShadow: "2px 3px 10px rgba(0,0,0,0.15)",
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 27.5px,
              rgba(0,0,0,0.08) 27.5px,
              rgba(0,0,0,0.08) 28px
            ),
            linear-gradient(
              to right,
              transparent 32px,
              #E8A0A0 32px,
              #E8A0A0 34px,
              transparent 34px
            ),
            linear-gradient(
              135deg,
              #FDF8F0 0%,
              #F5EDE0 100%
            )
          `,
          padding: "18px 18px 16px 40px",
        }}
      >
        {/* ── Scrollable bio text area (only this scrolls, not the composition) ── */}
        <div className="bio-paper-scroll overflow-y-auto flex-1 min-h-0">
          <p
            className="font-body text-xs sm:text-sm md:text-base text-neutral-800 whitespace-pre-line"
            style={{ lineHeight: "28px" }}
          >
            {bio}
          </p>
        </div>
      </div>

      {/* ── Bulldog clip — anchors paper stack at top-left ── */}
      <img
        src="/assets/elements/bulldog-clip.png"
        alt=""
        className="absolute pointer-events-none"
        style={{
          zIndex: 20,
          left: "1%",
          top: "3%",
          width: "12%",
          maxWidth: "80px",
          transformOrigin: "top left",
          filter: "drop-shadow(1px 2px 3px rgba(0,0,0,0.2))",
        }}
        aria-hidden="true"
      />

      {/* ── Profile photo — behind polaroid frame, visible through hollow center ── */}
      {picture && (
        <img
          src={picture}
          alt="Foto de perfil"
          className="absolute object-cover rounded-sm"
          style={{
            zIndex: 25,
            right: "4%",
            bottom: "4%",
            width: "14%",
            maxWidth: "110px",
            aspectRatio: "1 / 1",
            boxShadow: "1px 2px 4px rgba(0,0,0,0.1)",
          }}
        />
      )}

      {/* ── Polaroid frame — bottom-right, protrudes outside folder boundary ── */}
      <img
        src="/assets/elements/polaroid-frame.png"
        alt=""
        className="absolute pointer-events-none"
        style={{
          zIndex: 30,
          right: "-1%",
          bottom: "-3%",
          width: "22%",
          maxWidth: "160px",
          transform: "rotate(3deg)",
          filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.15))",
        }}
        aria-hidden="true"
      />

      {/* ── Paper clip — bottom-right edge, visually attaches polaroid to folder ── */}
      <img
        src="/assets/elements/clip.png"
        alt=""
        className="absolute pointer-events-none"
        style={{
          zIndex: 30,
          right: "0%",
          bottom: "6%",
          width: "10%",
          maxWidth: "50px",
          transform: "rotate(15deg)",
          filter: "drop-shadow(1px 2px 3px rgba(0,0,0,0.15))",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
