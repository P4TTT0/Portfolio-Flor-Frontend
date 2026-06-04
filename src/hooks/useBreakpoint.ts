"use client";

import { useEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

export interface UseBreakpointReturn {
  breakpoint: Breakpoint;
  isMobile: boolean; // < 640px
  isTablet: boolean; // 640–1024px
  isDesktop: boolean; // > 1024px
}

/**
 * Shared breakpoint detection hook.
 * Uses window.innerWidth + resize listener (SSR-safe).
 *
 * Breakpoints:
 * - mobile:  < 640px
 * - tablet:  640–1024px
 * - desktop: > 1024px
 */
export default function useBreakpoint(): UseBreakpointReturn {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const compute = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint("mobile");
      else if (width <= 1024) setBreakpoint("tablet");
      else setBreakpoint("desktop");
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop",
  };
}
