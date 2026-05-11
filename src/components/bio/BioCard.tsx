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
          zIndex: 12,
          left: "6%",
          top: "4%",
          width: "64%",
          height: "50%",
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
          transform: "rotate(6deg)",
          transformOrigin: "left top",
          boxShadow: "3px 8px 20px rgba(0,0,0,0.1)",
          filter: "brightness(0.96)",
        }}
        aria-hidden="true"
      />

      {/* ── Back paper bottom (protrudes below bio paper) ── */}
      <div
        className="absolute"
        style={{
          zIndex: 11,
          left: "6%",
          top: "9%",
          width: "61%",
          height: "57%",
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
          transform: "rotate(-5deg)",
          transformOrigin: "left top",
          boxShadow: "2px 3px 10px rgba(0,0,0,0.12)",
          filter: "brightness(0.92)",
        }}
        aria-hidden="true"
      />

      {/* ── Bio paper (ruled sheet, top layer of paper stack) ── */}
      <div
        className="absolute flex flex-col"
        style={{
          zIndex: 15,
          left: "5%",
          top: "8%",
          width: "65%",
          maxHeight: "70%",
          transform: "rotate(-0.5deg)",
          transformOrigin: "left top",
          boxShadow: "-5px 5px 7px rgba(0,0,0,0.15)",
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
          left: "-5%",
          top: "8%",
          width: "29%",
          maxWidth: "145px",
          transform: "rotate(-35deg)",
          transformOrigin: "left top",
          filter: "drop-shadow(4px -4px 3px rgba(0,0,0,0.2))",
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
            right: "-3%",
            bottom: "2%",
            width: "24%",
            maxWidth: "167px",
            aspectRatio: "1 / 1",
            transform: "rotate(8deg)",
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
          right: "-4%",
          bottom: "-9%",
          width: "29%",
          maxWidth: "180px",
          transform: "rotate(8deg)",
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
          right: "-4%",
          bottom: "28%",
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
