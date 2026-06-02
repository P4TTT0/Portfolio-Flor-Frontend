"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Find the scroll container (main element)
    const wrapper = document.querySelector("main") as HTMLElement | null;
    if (!wrapper) return;

    const lenis = new Lenis({
      wrapper,
      content: wrapper,
      duration: 0.8,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Expose lenis globally for programmatic scrolling
    (window as any).lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      delete (window as any).lenis;
      lenis.destroy();
    };
  }, []);

  return null;
}
