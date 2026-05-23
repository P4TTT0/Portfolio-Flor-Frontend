// Sticker configuration — distributed across entire scroll height
// Layer A: Background (static, speed 0)
// Layer B: Mid-ground (very slow, small movement)
// Layer C: Foreground (almost static, very large, strong blur)

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
  // Layer A — Background (STATIC, speed 0, no blur)
  {
    src: "/assets/stickers/radio.png",
    layer: "A",
    position: "left",
    top: "10%",
    rotation: -8,
    size: 90,
  },
  {
    src: "/assets/stickers/megaphone.png",
    layer: "A",
    position: "right",
    top: "30%",
    rotation: 12,
    size: 85,
  },
  {
    src: "/assets/stickers/bunny-face.png",
    layer: "A",
    position: "left",
    top: "55%",
    rotation: -5,
    size: 80,
  },
  {
    src: "/assets/stickers/hashtag-one.png",
    layer: "A",
    position: "right",
    top: "75%",
    rotation: 10,
    size: 75,
  },

  // Layer B — Mid-ground (very slow, small movement, light blur)
  {
    src: "/assets/stickers/yellow-heart.png",
    layer: "B",
    position: "right",
    top: "20%",
    rotation: -10,
    size: 120,
  },
  {
    src: "/assets/stickers/two-stars.png",
    layer: "B",
    position: "left",
    top: "45%",
    rotation: 15,
    size: 110,
  },
  {
    src: "/assets/stickers/multiple-starts.png",
    layer: "B",
    position: "right",
    top: "65%",
    rotation: -12,
    size: 115,
  },

  // Layer C — Foreground (almost static, VERY large, strong blur)
  {
    src: "/assets/stickers/headphones.png",
    layer: "C",
    position: "left",
    top: "15%",
    rotation: 18,
    size: 220,
  },
  {
    src: "/assets/stickers/blakc-star.png",
    layer: "C",
    position: "right",
    top: "50%",
    rotation: -14,
    size: 200,
  },
];

// Parallax speed multipliers (relative to scroll)
export const LAYER_SPEEDS: Record<ParallaxLayer, number> = {
  A: 0,      // Static (stuck to background)
  B: 0.12,   // Very slow (12% of scroll speed)
  C: 0.03,   // Almost static (3% of scroll speed)
};

// Blur values per layer
export const LAYER_BLURS: Record<ParallaxLayer, string> = {
  A: "none",
  B: "blur(1.5px)",
  C: "blur(4px)",
};
