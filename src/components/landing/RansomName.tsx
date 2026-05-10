"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { randomRotation } from "@/lib/youtube-utils";

interface RansomNameProps {
  name: string;
}

// Cache of discovered variant counts per letter key
// e.g. { "e": 3, "e-up": 1, "f": 2 }
const variantCache = new Map<string, number>();

function getLetterKey(char: string): string {
  const lower = char.toLowerCase();
  return char !== lower ? `${lower}-up` : lower;
}

function getLetterFile(char: string, variant: number): string {
  const lower = char.toLowerCase();
  const suffix = char !== lower ? "-up" : "";
  return `/assets/letters/${lower}-${variant}${suffix}.png`;
}

// Probe how many variants exist for a given letter by trying to load them
function probeVariants(char: string): Promise<number> {
  const key = getLetterKey(char);
  if (variantCache.has(key)) return Promise.resolve(variantCache.get(key)!);

  return new Promise((resolve) => {
    let count = 0;

    function tryNext(variant: number) {
      const img = new Image();
      img.onload = () => {
        count = variant;
        tryNext(variant + 1);
      };
      img.onerror = () => {
        variantCache.set(key, count);
        resolve(count);
      };
      img.src = getLetterFile(char, variant);
    }

    tryNext(1);
  });
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
  const [probed, setProbed] = useState(false);

  // Auto-scale to fit container width
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const parent = container.parentElement;
      if (!parent) return;

      const parentWidth = parent.clientWidth - 32;
      const contentWidth = container.scrollWidth;

      if (contentWidth > parentWidth) {
        setScale(parentWidth / contentWidth);
      } else {
        setScale(1);
      }
    });

    observer.observe(container.parentElement);
    return () => observer.disconnect();
  }, [name]);

  // Probe all unique letter keys in the name
  useEffect(() => {
    const uniqueKeys = new Set(name.split("").map(getLetterKey));
    const probes = Array.from(uniqueKeys).map((key) => {
      const char = key.endsWith("-up") ? key.replace("-up", "").toUpperCase() : key[0];
      return probeVariants(char);
    });

    Promise.all(probes).then(() => setProbed(true));
  }, [name]);

  const pickVariant = useCallback((char: string): string | null => {
    const key = getLetterKey(char);
    const count = variantCache.get(key);
    if (!count || count < 1) return null;

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
              const imgSrc = probed ? pickVariant(char) : null;
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
