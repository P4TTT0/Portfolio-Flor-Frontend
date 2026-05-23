"use client";

import { useEffect, useRef, useState } from "react";
import {
  STICKERS,
  LAYER_SPEEDS,
  LAYER_BLURS,
  type StickerConfig,
} from "@/lib/stickers-config";

interface StickersParallaxProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

interface StickerProps {
  config: StickerConfig;
  scrollY: number;
}

function Sticker({ config, scrollY }: StickerProps) {
  const speed = LAYER_SPEEDS[config.layer];
  const blur = LAYER_BLURS[config.layer];
  const translateY = scrollY * speed;

  return (
    <img
      src={config.src}
      alt=""
      className="absolute pointer-events-none"
      style={{
        top: config.top,
        [config.position]: "5%",
        transform: `translateY(${translateY}px) rotate(${config.rotation ?? 0}deg)`,
        width: `${config.size ?? 80}px`,
        height: "auto",
        filter: blur,
        willChange: "transform",
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  );
}

export default function StickersParallax({ containerRef }: StickersParallaxProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);

  // Check viewport on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Parallax scroll handler — listens to container scroll, not window
  useEffect(() => {
    if (isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setScrollY(container.scrollTop);
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isMobile, containerRef]);

  // Don't render on mobile
  if (isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
      {STICKERS.map((sticker, i) => (
        <Sticker key={`${sticker.src}-${i}`} config={sticker} scrollY={scrollY} />
      ))}
    </div>
  );
}
