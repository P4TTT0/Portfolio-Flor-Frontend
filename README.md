# Portfolio — Florencia Acevedo

A single-page portfolio site for **Florencia Acevedo**, a national radio host (*Locutora Nacional*), built with **Next.js 16** and **Sanity CMS**. The landing is a full-viewport scroll-snap layout: five vertical sections (Bio, Demos, Samples, Works, Social) with a horizontal social-media carousel nested inside Social.

> Production site for a working voice talent. Every section serves a real purpose; the architecture is opinionated — one scroll authority, one audio engine, one CMS source.

---

## 🎯 About the Project

- **Bio** — profile card with photo, role, and bio
- **Demos** — YouTube-hosted demo reels, organized by category, opened in a notebook-style modal
- **Samples** — audio reels (institutional, commercial, narration, events) played in a custom Web Audio waveform player
- **Works** — placeholder section, ready for upcoming client work
- **Social** — horizontal carousel of social profiles (Instagram, YouTube, Spotify, etc.) with platform-specific branding
- **Contact** — form that posts to `/api/contact`, which sends an email via Resend

The visual language is **handmade / scrapbook**: kraft paper textures, hand-cut paper cards, post-it notes, paper clips, tape strips, animated title overlays. The CSS does most of the work; the React layer is just composition.

---

## ✨ Features

- 5-section vertical scroll-snap landing (pure CSS)
- Nested horizontal carousel in Social with a custom wheel-event broker
- Custom Web Audio API engine with cached peak data for waveform visualization
- SVG ink-stroke waveform player (100 bars, click-to-seek, keyboard nav)
- Scaled-canvas responsive design — fixed 1200×800 design canvas that scales uniformly, rotates on mobile
- SVG path-based paper folder UI for the Samples section
- Character-level PNG rendering of the name with random rotation/scale
- Sanity-driven content (profile, demos, samples, social) with static fallbacks
- Resend-powered contact form with destination email fetched from Sanity at request time
- 5 Google Fonts loaded via `next/font` (subset + preload, zero CLS)
- `prefers-reduced-motion` honored (disables snap)

---

## 🧱 Tech Stack

- **Framework:** Next.js 16.2.4 (App Router, `src/` directory)
- **UI:** React 19.2.4 + TypeScript 5 (strict)
- **Styling:** Tailwind CSS v4 (PostCSS plugin, tokens in `globals.css`)
- **CMS:** Sanity (`@sanity/client`, `next-sanity`)
- **Email:** Resend
- **Fonts:** `next/font/google` — Playfair Display, Lato, Archivo Black, League Spartan, Cormorant Garamond
- **Icons:** `react-icons`

---

## 🏗️ Architecture

```
<LandingContent>
├── <main> snap-y snap-mandatory h-dvh overflow-y-auto
│   ├── <BioSection>          id="bio"
│   ├── <DemosSection>        id="demos"
│   ├── <SamplesSection>      id="samples"
│   ├── <WorksSection>        id="works"
│   ├── <SocialSection>       id="social"    (contains horizontal carousel)
│   └── <ContactSection>      id="contact"
└── <SectionNav>                              (fixed right-side progress bar)
```

### Component organization

| Folder                     | Purpose                                                                    |
|----------------------------|----------------------------------------------------------------------------|
| `components/sections/`     | Top-level page sections — all `h-dvh` + `snap-start`                       |
| `components/{bio,contact,demos,samples,social,landing,craft}/` | Leaf components grouped by feature                |
| `hooks/`                   | `useBreakpoint`, `useAudioPlayer`                                          |
| `lib/`                     | Sanity client, data fetching, static fallback, social config, YT utils    |
| `app/api/contact/`         | POST handler → Resend                                                      |

---

## 🛠️ Key Technical Decisions

### 1. Scroll-snap: CSS-only, not Lenis/Embla

The landing is five full-viewport sections, each snapping into place. Initial iterations stacked **three** scroll authorities on the same surface:

- **Lenis** for smooth scroll
- **Embla** for the horizontal carousel inside Social
- A custom `ScrollSnapHelper` for direction-aware snap behavior

After ~10 rebuilds (CSS snap, then `ScrollSnapHelper`, then Lenis+Embla, then wheel-hijacking with edge-bubbling, then back to CSS), the architecture collapsed to:

- **Vertical snap**: pure CSS `snap-y snap-mandatory` on `<main>`, with `snap-start` on each section. No JS, no animation library.
- **Horizontal carousel inside SocialSection**: native `overflow-x-auto` + `snap-x snap-mandatory`. A custom wheel handler converts `deltaY` to `scrollLeft` but **only consumes the event when the carousel can scroll further**. At the edges, the wheel event bubbles up to the page-level snap and vertical page scroll resumes naturally.

**Why:** one scroll authority wins. No animated interpolation, no race conditions between Lenis and the native snap, no listeners fighting for wheel events. The `isTouchCoarse` check (`matchMedia('(pointer: coarse)')`) skips the wheel handler on touch devices, so mobile gets native horizontal swipe.

### 2. Audio engine: Web Audio API, not `<audio>`

`useAudioPlayer` uses `AudioContext` + `AudioBufferSourceNode` + `GainNode` directly, with `decodeAudioData` for decoding the MP3 stream. This gives:

- **Sample-accurate timing** for the playhead / waveform progress
- **Programmatic gain control** for the volume slider
- **Raw audio data access** for peak extraction

The hook pre-decodes the buffer when the URL changes (one `fetch` + `decodeAudioData`), caches the `AudioBuffer` in a ref, and `play()` reuses it without re-fetching.

**Race-condition guards:** `isPlayingRef` is checked synchronously before any async work, and re-checked after `await` to prevent double-execution. `source.onended` only resets state if the current source matches (so a stale callback doesn't kill a freshly-started one). A `cancelled` flag in the `useEffect` cleanup prevents state updates after unmount.

**Peaks** are computed once per track in `computePeaks()` (walks the channel data in 100 buckets) and stored in a **module-level `Map`** so they survive across hook instances — switching categories doesn't recompute peaks for tracks you've already loaded.

### 3. Waveform player: SVG, 100 bars, no library

`WaveformPlayer` renders 100 `<rect>` elements scaled to a `viewBox="0 0 100 100"` with `preserveAspectRatio="none"`. Each bar's height is the peak amplitude at that bucket; played bars are full opacity, pending bars are dimmed. The playhead is a `<line>` whose `x1`/`x2` track `currentTime / duration`.

Interactions:

- **Click to seek** — `e.clientX` mapped to fraction of the SVG bounding rect
- **Arrow key seek** — `ArrowLeft`/`ArrowRight` step ±5%
- **Slider role** — proper `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`
- **Loading / error states** — overlay text inside the waveform area

Bar geometry (`BAR_GAP`, `BAR_WIDTH`) is module-level since `PEAK_BUCKETS` is constant.

### 4. Scaled-canvas responsive design (DemosSection)

Demos are laid out on a fixed `1200×800` *pizarra* (chalkboard) design canvas. To make this work on every viewport, the canvas:

- Scales uniformly to fit its parent (`min(widthRatio, heightRatio, maxScale)`)
- Uses `ResizeObserver` to recompute the scale on resize (only when change > 0.001, to avoid render thrash)
- On mobile (< 640px), the whole canvas **rotates 90°** so the 1200×800 layout becomes a vertical scroll of horizontal cards; the grid counter-rotates to keep cards upright, and a `marginLeft: -72px` pulls them back into the visible area

The scaling factor, grid config (columns / gap / padding), and paper-star position are all per-breakpoint (`mobile`/`tablet`/`desktop`).

### 5. FolderPapers: SVG path-based paper sheets

The Samples section uses a **two-tab folder** UI. Each tab is an SVG path — a paper rectangle with a tab cutout at the top — and the rough-paper texture is a separate `<div>` with a CSS `mask-image` derived from the same path. The active tab pops up by 7px on `cubic-bezier(0.25, 0.46, 0.45, 0.94)` easing, with a 350ms transition.

**Key detail:** tab buttons are rendered **outside** the paper wrappers (z-index 30 vs 1) so they stay clickable even when the inactive paper is in front. The mask ensures the rough-paper texture only renders inside the paper shape, not on the tab cutouts.

### 6. RansomName: character-level PNGs with random rotation

The hero name "Florencia Acevedo" is rendered as a sequence of PNG letter tiles. Each letter has 1–2 visual variants (e.g. `e-1.png`, `e-2.png`); on render, a random variant is picked. Each tile is rotated by a random angle in `[-10°, +10°]` and scaled by a random factor in `[0.85, 1.15]`.

A `ResizeObserver` auto-scales the whole name to fit its parent width on `sm+` viewports (where the row is no-wrap). Letters without PNG variants fall back to styled text spans so missing assets never cause 404s.

### 7. Sanity: direct GROQ, denormalized asset URLs

No `next-sanity` heavy abstractions — just `client.fetch` with hand-written GROQ. Asset references are denormalized at query time using `asset->url`:

```ts
*[_type == "profile"][0] { name, role, bio, "picture": picture.asset->url }
*[_type == "sample"] | order(_createdAt desc) {
  title, category, "audioUrl": audioFile.asset->url, duration
}
```

All four content types (profile, demos, samples, social) are fetched in a single `Promise.all` on mount, with a module-level `cancelled` flag for unmount safety.

**The contact form's destination email is fetched from Sanity on every request** — the site owner can change the recipient without redeploying.

### 8. Visual texture system in pure CSS

`globals.css` defines the entire handmade / scrapbook vocabulary as utility classes — no Tailwind plugin, no inline SVG noise:

- `.kraft-texture` — base kraft paper gradient + `::after` cartoon overlay (opacity 0.06)
- `.kraft-sage` / `-avocado` / `-blush` / `-peach` / `-oat` — color variants via `--kraft-light` custom property
- `.tape-strip` — semi-transparent tape gradient with subtle `backdrop-filter` blur
- `.volume-slider` — minimal slider (WebKit + Firefox pseudo-elements)
- Scrollbar hidden (WebKit + Firefox)
- `prefers-reduced-motion` disables snap

### 9. Performance

- **5 Google Fonts** via `next/font/google` — automatic subsetting, preload, zero CLS
- **YouTube thumbnails** via `next/image` with `remotePatterns` allowlist (CDN + responsive `sizes`)
- **Above-fold images** marked `priority` (the pizarra, the contact text SVG)
- **Below-fold images** use `loading="lazy"`
- **Audio buffer** decoded once and cached — no re-fetch on play/pause toggle
- **Peak data** cached in a module-level `Map` — survives across hook instances
- `100dvh` everywhere instead of `100vh` for proper mobile browser chrome handling

---

## 🗃️ Sanity Schema

| Type      | Fields                                                                                              |
|-----------|-----------------------------------------------------------------------------------------------------|
| `profile` | `name`, `role`, `bio`, `picture` (image), `email`, `social[]` (platform, url, username, description) |
| `demo`    | `title`, `category`, `videoUrl` (YouTube URL)                                                       |
| `sample`  | `title`, `category`, `audioFile` (file asset), `duration` (number, seconds)                          |

---


---

## 📄 License

This codebase is the production portfolio for a real client. The source is shared for learning/portfolio purposes; please don't republish the assets (photos, audio reels, design PNGs) or clone the visual identity 1:1.

---

## 👤 Author

Built by **P4TTT0**
- GitHub: https://github.com/P4TTT0
