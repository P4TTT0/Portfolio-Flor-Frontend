# Tasks: Social Section Scroll — Vertical Snap + Horizontal Carousel

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~+188 / -295 (net -107) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full implementation | PR 1 | Single PR; all tasks included. ~483 total touched lines, net well under 400. |

## Phase 1: Foundation / Dependencies

- [ ] 1.1 Add `embla-carousel-wheel-gestures@^8.1.0` to `package.json` dependencies
- [ ] 1.2 Create `src/types/embla.d.ts` — augment `HTMLElement` with `__emblaApi?: EmblaCarouselType`
- [ ] 1.3 Create `src/lib/snap-events.ts` — `subscribeActiveSection(cb)` / `emitActiveSection(index, el)` module
- [ ] 1.4 Update `globals.css` — replace `scroll-snap-type: none` rule with comment pointing to Lenis Snap

## Phase 2: Core Implementation

- [ ] 2.1 Rewrite `SmoothScroll.tsx` — init Lenis Snap (`type:'mandatory'`, `debounce:0`), add `virtualScroll` broker for Embla handoff, emit on `onSnapComplete`/`onSnapStart`
- [ ] 2.2 Rewrite `SocialSection.tsx` — `useEmblaCarousel` + `WheelGesturesPlugin({ forceWheelAxis:'y' })`, expose `__emblaApi` via `viewportRef`, drop manual wheel handler and CSS snap classes

## Phase 3: Integration / Cleanup

- [ ] 3.1 Update `SectionNav.tsx` — subscribe to `snap-events` for active section index; keep Lenis `on('scroll')` for progress bar
- [ ] 3.2 Remove `snap-y snap-mandatory` from `<main>` in `LandingContent.tsx`
- [ ] 3.3 Remove `snap-start` class from `BioSection.tsx`
- [ ] 3.4 Remove `snap-start` class from `DemosSection.tsx`
- [ ] 3.5 Remove `snap-start` from `SamplesSection.tsx` (2 section elements)
- [ ] 3.6 Remove `snap-start` from `PlaceholderSection.tsx`
- [ ] 3.7 Delete `src/components/ui/ScrollSnapHelper.tsx`

## Phase 4: Verification

- [ ] 4.1 Remove imports and references to deleted ScrollSnapHelper across the codebase
- [ ] 4.2 `npm run build` — verify no TS errors, no console warnings
- [ ] 4.3 Manual E2E: vertical snap between all sections — never stuck mid-section
- [ ] 4.4 Manual E2E: inside Social carousel, wheel down advances slides (page stays)
- [ ] 4.5 Manual E2E: carousel at right edge → wheel down → page exits to next section
- [ ] 4.6 Manual E2E: carousel at left edge → wheel up → page snaps to previous section
