// Sticker configuration — add new stickers here as they're added to public/assets/elements/
// Each sticker is assigned to a parallax layer (A, B, or C)

export type ParallaxLayer = "A" | "B" | "C";

export interface StickerConfig {
  src: string;
  layer: ParallaxLayer;
  position: "left" | "right";
  top: string; // CSS top value (%, vh, px, etc.)
  rotation?: number; // degrees
  size?: number; // width in px
}

export const STICKERS: StickerConfig[] = [
  // Layer A — Background (no blur, normal scroll speed)
  {
    src: "/assets/elements/stars.png",
    layer: "A",
    position: "left",
    top: "15%",
    rotation: -12,
    size: 80,
  },
  {
    src: "/assets/elements/paper.png",
    layer: "A",
    position: "right",
    top: "35%",
    rotation: 8,
    size: 90,
  },
  {
    src: "/assets/elements/clip.png",
    layer: "A",
    position: "left",
    top: "65%",
    rotation: 15,
    size: 60,
  },
  {
    src: "/assets/elements/bulldog-clip.png",
    layer: "A",
    position: "right",
    top: "85%",
    rotation: -10,
    size: 70,
  },

  // Layer B — Mid-ground (light blur, slower scroll)
  {
    src: "/assets/elements/polaroid-frame.png",
    layer: "B",
    position: "right",
    top: "20%",
    rotation: -6,
    size: 100,
  },
  {
    src: "/assets/elements/wooden-clip.png",
    layer: "B",
    position: "left",
    top: "45%",
    rotation: 12,
    size: 75,
  },
  {
    src: "/assets/elements/pin.png",
    layer: "B",
    position: "right",
    top: "70%",
    rotation: -8,
    size: 65,
  },

  // Layer C — Foreground (strong blur, slowest scroll)
  {
    src: "/assets/elements/paper-star.png",
    layer: "C",
    position: "left",
    top: "25%",
    rotation: 18,
    size: 110,
  },
  {
    src: "/assets/elements/headphones.png",
    layer: "C",
    position: "right",
    top: "55%",
    rotation: -14,
    size: 120,
  },
];

// Parallax speed multipliers
export const LAYER_SPEEDS: Record<ParallaxLayer, number> = {
  A: 1.0,    // Normal speed (1:1 with scroll)
  B: 0.6,    // 60% of scroll speed
  C: 0.3,    // 30% of scroll speed
};

// Blur values per layer
export const LAYER_BLURS: Record<ParallaxLayer, string> = {
  A: "none",
  B: "blur(1px)",
  C: "blur(3px)",
};
