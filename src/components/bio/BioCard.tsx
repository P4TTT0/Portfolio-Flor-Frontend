"use client";

interface BioCardProps {
  bio: string;
  picture?: string | null;
}

/**
 * BioCard — CSS-only ruled notebook paper.
 *
 * Replaces the old bio-paper.png <img> with a layered CSS background:
 *  1. repeating-linear-gradient for horizontal ruled lines (28px spacing)
 *  2. linear-gradient for the red left margin line
 *  3. linear-gradient for subtle paper texture
 *
 * Paper is positioned at bottom-left (80% width) with a slight rotation
 * and drop shadow for the handmade scrapbook aesthetic. Text line-height
 * matches the 28px gradient step so bio text aligns on the ruled lines.
 */
export default function BioCard({ bio, picture }: BioCardProps) {
  return (
    <div className="relative w-full flex-1 min-h-0 flex flex-col justify-end items-start">
      {/* Profile picture — behind the bio paper, on the folder layer */}
      {picture && (
        <div
          className="absolute z-10"
          style={{
            top: "12%",
            right: "12%",
            width: "26%",
            maxWidth: "130px",
            aspectRatio: "1 / 1",
          }}
        >
          <img
            src={picture}
            alt="Foto de perfil"
            className="w-full h-full object-cover rounded-sm"
            style={{
              transform: "rotate(3deg)",
              boxShadow: "2px 3px 8px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      )}

      {/* CSS-only ruled paper — bottom-left via flex layout, 80% width, content-driven height */}
      {/* Uses flex justify-end/items-start instead of absolute positioning so paper */}
      {/* stays in flow — overflow triggers Folder scrollbar naturally for long bios. */}
      <div
        className="z-20"
        style={{
          width: "80%",
          transform: "rotate(-1.2deg)",
          transformOrigin: "bottom left",
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
        <p
          className="font-body text-xs sm:text-sm md:text-base text-neutral-800 whitespace-pre-line"
          style={{ lineHeight: "28px" }}
        >
          {bio}
        </p>
      </div>
    </div>
  );
}
