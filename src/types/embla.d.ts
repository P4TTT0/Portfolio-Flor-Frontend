import type { EmblaCarouselType } from "embla-carousel";

/**
 * Module augmentation: allow storing the Embla API instance on the
 * viewport DOM node so Lenis's `virtualScroll` broker (running in
 * SmoothScroll, outside React's tree) can read it imperatively.
 *
 * Why a property on the element instead of a context/Map/global:
 *   - local to the DOM node (no SSR leak, no global pollution)
 *   - no React context overhead
 *   - Lenis already has the element reference via the wheel event target
 */
declare global {
  interface HTMLElement {
    __emblaApi?: EmblaCarouselType;
  }
}

export {};