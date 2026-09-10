"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";

/**
 * Deterministic noise in [0, 1), hashed from an integer seed.
 *
 * These letters are server-rendered, so anything that can differ between the
 * server and the browser shows up as a hydration mismatch on every letter.
 * That rules out `Math.random()` — and it also rules out the usual
 * `sin(x) * 43758.5453` trick, because ECMAScript defines `Math.sin` as
 * IMPLEMENTATION-APPROXIMATED: two engines may disagree in the last bit, and
 * multiplying by ~4.4e4 pushes that disagreement up into digits React compares
 * as part of the style string.
 *
 * Integer bit operations have no such freedom — `Math.imul`, `^` and `>>>` are
 * exactly specified, so this produces identical output on every engine.
 * (Hash finalizer from MurmurHash3.)
 */
function noise(seed: number): number {
  let h = seed | 0;
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Rounds before the value ever reaches an attribute.
 *
 * Belt and braces next to the integer hash: a short decimal string cannot drift
 * between the two render passes even if something upstream changes, and it
 * keeps sixteen-digit floats out of the HTML.
 */
function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

function rotationFrom(n: number, min = -10, max = 10): number {
  return n * (max - min) + min;
}

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
  return `/assets/letters/${lower}-${variant}${suffix}.webp`;
}

function getVariantCount(char: string): number {
  const key = getLetterKey(char);
  return KNOWN_VARIANTS[key] ?? 0;
}

function generateStyles(name: string) {
  return name.split("").map((_, index) => {
    // Five draws per letter, spaced so neighbouring letters never share one.
    const n = (k: number) => noise(index * 5 + k + 1);

    // Four poses per cycle at 380-620ms holds each one for roughly 95-155ms —
    // 6 to 10 frames per second. That low frame rate is what sells stop motion;
    // speed it up much past this and it stops reading as hand-shot and starts
    // reading as a vibration.
    const duration = Math.round(380 + n(0) * 240);

    return {
      rotation: round(rotationFrom(n(1)), 2),
      scale: round(0.85 + n(2) * 0.3, 4),
      // Signed, so about half the letters boil the other way round.
      amplitude: round((0.7 + n(3)) * (n(4) < 0.5 ? -1 : 1), 2),
      duration,
      // A NEGATIVE delay drops each letter at a random point in a cycle that is
      // already running, so they are out of phase on the very first frame. A
      // positive stagger would leave them marching in step until their
      // different durations slowly pulled them apart.
      delay: -Math.round(n(5) * duration),
    };
  });
}

type LetterStyle = ReturnType<typeof generateStyles>[number];

/**
 * Per-letter inputs to the `ransom-boil` keyframes. `scale` is overridable
 * because the text fallback has no scale of its own to preserve.
 */
function boilVars(style: LetterStyle, scale: number = style.scale) {
  return {
    "--boil-base": `${style.rotation}deg`,
    "--boil-scale": scale,
    "--boil-amp": `${style.amplitude}deg`,
    "--boil-duration": `${style.duration}ms`,
    "--boil-delay": `${style.delay}ms`,
  } as CSSProperties;
}

export default function RansomName({ name }: RansomNameProps) {
  const [letterStyles] = useState(() => generateStyles(name));
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Auto-scale to fit container width (only on sm+ where flex-nowrap is active)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parent = container.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(() => {
      // Only scale on sm+ (640px+) where flex-nowrap is active
      if (window.innerWidth < 640) {
        setScale(1);
        return;
      }

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

  const pickVariant = useCallback((char: string, index: number): string | null => {
    const count = getVariantCount(char);
    if (count < 1) return null;

    // Seeded, not random: this picks the `src`, so a server/client disagreement
    // here swaps the rendered image during hydration.
    const variant = Math.floor(noise(index * 31 + 7) * count) + 1;
    return getLetterFile(char, variant);
  }, []);

  // Split name into words to add extra spacing between them
  const words = name.split(" ");

  // `overflow-x-clip`, not `overflow-hidden`: rotation and the random per-letter
  // scale push the tallest letters about 8.5px past the flex row on each side —
  // transforms never grow the layout box — and `overflow-x: hidden` would force
  // `overflow-y` to `auto`, so the two axes cannot be split that way. `clip`
  // can. The vertical padding keeps that spill off the subtitle, which
  // otherwise sits exactly 8px below.
  return (
    <div className="flex items-center justify-center overflow-x-clip py-1">
      <div
        ref={containerRef}
        className="flex items-center justify-center flex-wrap sm:flex-nowrap"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          transition: "transform 0.3s ease-out",
        }}
      >
        {words.map((word, wi) => (
          <span key={wi} className="inline-flex items-center">
            {word.split("").map((char, i) => {
              const index =
                words.slice(0, wi).reduce((sum, w) => sum + w.length + 1, 0) + i;
              const imgSrc = pickVariant(char, index);
              const style = letterStyles[index];

              if (imgSrc) {
                return (
                  <img
                    key={i}
                    src={imgSrc}
                    alt=""
                    aria-hidden="true"
                    className="ransom-letter h-10 sm:h-12 md:h-14 w-auto object-contain"
                    style={{
                      ...boilVars(style),
                      // Kept as the resting pose: the running animation outranks
                      // it, and it takes over again under reduced motion.
                      transform: `rotate(${style.rotation}deg) scale(${style.scale})`,
                      marginLeft: "clamp(-12px, -2vw, -20px)",
                    }}
                  />
                );
              }

              // Fallback: render as text with ransom style
              return (
                <span
                  key={i}
                  className="ransom-letter font-heading text-3xl sm:text-4xl md:text-5xl text-text-primary"
                  style={{
                    ...boilVars(style, 1),
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
              <span className="w-6 sm:w-6 md:w-8" aria-hidden="true" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
