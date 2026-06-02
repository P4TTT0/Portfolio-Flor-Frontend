# Exploration: Samples Section — Audio Playback (Cuaderno de Guiones)

## Current State

The portfolio uses a **full-viewport snap-scroll layout** (`h-screen` sections, `snap-y snap-mandatory`). Each section occupies exactly one viewport height and snaps into place on scroll. Navigation is handled by `SectionNav` (fixed right-side dots) using `IntersectionObserver` with `threshold: 0.5`.

**Relevant files:**
- `src/lib/use-sanity-content.ts` — Data fetching hook. Already queries `*[_type == "sample"]` but `SampleItem` only has `{ title, category }`. No audio URL field.
- `src/lib/landing-data.ts` — Static fallback data. Defines the 5 sections (bio, demos, samples, works, social) with colors. `samples` has no content/audio data.
- `src/lib/sanity.ts` — Sanity client config. Uses `@sanity/client` v7, `@sanity/image-url` v2. No file/blob URL builder configured.
- `src/app/LandingContent.tsx` — Main layout. Destructures `samples` from `useSanityContent()` but **does not pass it anywhere**. Currently renders `<PlaceholderSection id="samples" ... />`.
- `src/components/sections/PlaceholderSection.tsx` — Generic placeholder with kraft texture. Samples uses `color="blush"`.
- `src/components/sections/SectionNav.tsx` — Dot navigation. `sectionIds` and `labels` arrays include "samples" / "Samples" at index 2.
- `src/app/globals.css` — Tailwind v4 config. Colors: sage, avocado, blush, peach, oat, cream. Kraft textures defined via `.kraft-texture` and `.kraft-*` classes.
- `src/app/sanity-test/page.tsx` — Confirms Sanity schema `sample` exists with fields: `title`, `category`, `slug`.

**No audio files** exist in `public/`.

---

## Affected Areas

| File | Why affected |
|------|-------------|
| `src/lib/use-sanity-content.ts` | Must add `audioUrl` (and possibly `duration`) to `SampleItem` interface and GROQ query |
| `src/lib/landing-data.ts` | Should add static fallback sample data (categories + tracks) for offline/Sanity-failure scenarios |
| `src/app/LandingContent.tsx` | Must replace `<PlaceholderSection id="samples" />` with `<SamplesSection samples={samples} />` |
| `src/components/sections/` | New `SamplesSection.tsx` + sub-components (Notebook, Tabs, TrackList, WaveformPlayer) |
| Sanity CMS schema | Need to add `audioUrl` (or `audioFile` asset reference) to the `sample` document type |
| `public/` (optional) | May host static MP3/WAV files as a fallback or primary source |

---

## Approaches

### 1. Static audio files + local state (fastest, no CMS dependency)
- Host MP3s in `public/audio/`, hardcode a `SAMPLES_DATA` array in `src/lib/samples-data.ts`
- `useSanityContent` fetches from Sanity but falls back to static data if empty/error
- Pros: Works immediately; no Sanity schema changes; fast iteration
- Cons: Requires deploys to update audio; not scalable
- Effort: **Low**

### 2. Sanity-hosted audio URLs (recommended for production)
- Add `audioUrl` (string) or `audioFile` (file asset) to Sanity `sample` schema
- Update GROQ in `useSanityContent` to fetch the new field
- Use Sanity's asset URL (e.g. `https://cdn.sanity.io/files/...`) or a custom string field
- Pros: Content-managed; no deploys needed to add tracks; consistent with existing CMS pattern (Demos, Bio, Social)
- Cons: Requires Sanity schema update (separate studio project or API mutation); audio file hosting limits depend on Sanity plan
- Effort: **Medium**

### 3. Hybrid — Sanity metadata + static audio files
- Keep `title`, `category` in Sanity; store `audioUrl` as absolute paths like `/audio/spot.mp3`
- Pros: Content-managed metadata; audio files served statically (cheaper/faster)
- Cons: Slightly more complex fallback logic
- Effort: **Medium**

---

## Recommendation

**Go with Approach 2 (Sanity-hosted)** because the project already uses Sanity as the single source of truth for all content. The existing `sample` schema only needs one new field. For development velocity, start with **static fallback data** (Approach 1 style) so the UI can be built and tested before the CMS is updated.

**Proposed data structure:**
```ts
// src/lib/use-sanity-content.ts
export interface SampleItem {
  title: string;
  category: string;
  audioUrl: string;        // NEW
  duration?: number;       // NEW — seconds, for display
}

// GROQ query update:
client.fetch<SampleItem[]>(`*[_type == "sample"] | order(_createdAt desc) {
  title, category, audioUrl, duration
}`)
```

**Sanity schema update needed:**
```js
// In Sanity studio (separate project or via API)
{
  name: 'sample',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'category', type: 'string' },
    { name: 'audioUrl', type: 'url' },  // or 'file' type for uploads
    { name: 'duration', type: 'number' }
  ]
}
```

**Layout constraints:**
- Section must be `h-screen flex items-center justify-center` to fit the snap-scroll
- Content area should respect `max-w-[min(80vw,700px)]` and `maxHeight: calc(100vh - 4rem)` like PlaceholderSection
- The waveform player will sit at the bottom of the notebook, so the track list needs a scrollable area above it

**Ready for Proposal?**
Yes. The orchestrator should tell the user:
> "We need to add an `audioUrl` field to the Sanity `sample` schema. In parallel, we can build the `SamplesSection` UI using static fallback data so you can see and test it immediately. Should I proceed with the proposal?"
