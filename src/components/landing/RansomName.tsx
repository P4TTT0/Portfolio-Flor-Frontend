"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { randomRotation } from "@/lib/youtube-utils";

interface RansomNameProps {
  name: string;
}

// Known variant counts per letter key — updated manually when new letter files are added.
// e.g. { "e": 3, "e-up": 1, "f": 2 }
// No probing needed — zero 404s.
const KNOWN_VARIANTS: Record<string, number> = {
  "a": 1,
  "a-up": 1,
  "c": 1,
  "d": 1,
  "e": 2,
  "f": 1,
  "f-up": 1,
  "i": 1,
  "l": 1,
  "n": 1,
  "o": 1,
  "r": 1,
  "v": 1,
};

function getLetterKey(char: string): string {
  const lower = char.toLowerCase();
  return char !== lower ? `${lower}-up` : lower;
}

function getLetterFile(char: string, variant: number): string {
  const lower = char.toLowerCase();
  const suffix = char !== lower ? "-up" : "";
  return `/assets/letters/${lower}-${variant}${suffix}.png`;
}

function getVariantCount(char: string): number {
  const key = getLetterKey(char);
  return KNOWN_VARIANTS[key] ?? 0;
}

function generateStyles(name: string) {
  return name.split("").map(() => ({
    rotation: randomRotation(-10, 10),
    scale: 0.85 + Math.random() * 0.3,
  }));
}

export default function RansomName({ name }: RansomNameProps) {
  const [letterStyles] = useState(() => generateStyles(name));
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Auto-scale to fit container width
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parent = container.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(() => {
      const parentWidth = parent.clientWidth - 32;
      const contentWidth = container.scrollWidth;

      if (contentWidth > parentWidth) {
        setScale(parentWidth / contentWidth);
      } else {
        setScale(1);
      }
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, [name]);

  const pickVariant = useCallback((char: string): string | null => {
    const count = getVariantCount(char);
    if (count < 1) return null;

    const variant = Math.floor(Math.random() * count) + 1;
    return getLetterFile(char, variant);
  }, []);

  // Split name into words to add extra spacing between them
  const words = name.split(" ");

  return (
    <div className="flex items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="flex items-center justify-center whitespace-nowrap"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          transition: "transform 0.3s ease-out",
        }}
      >
        {words.map((word, wi) => (
          <span key={wi} className="inline-flex items-center">
            {word.split("").map((char, i) => {
              const imgSrc = pickVariant(char);
              const style = letterStyles[
                words.slice(0, wi).reduce((sum, w) => sum + w.length + 1, 0) + i
              ];

              if (imgSrc) {
                return (
                  <img
                    key={i}
                    src={imgSrc}
                    alt={char}
                    className="h-10 sm:h-12 md:h-14 w-auto object-contain"
                    style={{
                      transform: `rotate(${style.rotation}deg) scale(${style.scale})`,
                      marginLeft: "-20px",
                    }}
                  />
                );
              }

              // Fallback: render as text with ransom style
              return (
                <span
                  key={i}
                  className="font-heading text-3xl sm:text-4xl md:text-5xl text-text-primary"
                  style={{
                    transform: `rotate(${style.rotation}deg)`,
                    display: "inline-block",
                    marginLeft: "-4px",
                  }}
                >
                  {char}
                </span>
              );
            })}
            {/* Extra space between words */}
            {wi < words.length - 1 && (
              <span className="w-4 sm:w-6 md:w-8" aria-hidden="true" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
