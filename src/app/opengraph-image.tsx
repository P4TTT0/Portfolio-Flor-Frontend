import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Florencia Acevedo — Locutora Nacional";

/**
 * Social share card.
 *
 * Generated rather than shipped as a file so it cannot drift from the site's
 * palette, and so there is no extra binary in `public/`. Kept to system fonts
 * on purpose: pulling a webfont here makes the build depend on a network fetch
 * for an image almost nobody sees being generated.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F2EB",
          color: "#3D3D3D",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          Florencia Acevedo
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 36,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#6B6B6B",
          }}
        >
          Locutora Nacional
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            width: 220,
            height: 6,
            backgroundColor: "#818263",
          }}
        />
      </div>
    ),
    size,
  );
}
