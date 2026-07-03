"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { SampleItem } from "@/lib/use-sanity-content";
import FolderPapers from "@/components/samples/FolderPapers";
import TrackList from "@/components/samples/TrackList";
import WaveformPlayer, {
  type WaveformPlayerHandle,
} from "@/components/samples/WaveformPlayer";
import SectionTitleOverlay from "@/components/ui/SectionTitleOverlay";

// ---------------------------------------------------------------------------
// SamplesSection
// ---------------------------------------------------------------------------

interface SamplesSectionProps {
  id: string;
  samples: SampleItem[];
}

export default function SamplesSection({
  id,
  samples,
}: SamplesSectionProps) {
  // Enriched samples with client-side computed durations
  const [enrichedSamples, setEnrichedSamples] =
    useState<SampleItem[]>(samples);

  // Pre-compute durations for all tracks that have audioUrl but no duration
  useEffect(() => {
    const missing = samples.filter((s) => s.audioUrl && !s.duration);
    if (missing.length === 0) return;

    let cancelled = false;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    const ctx = new Ctor();

    (async () => {
      const updates: Record<string, number> = {};

      for (const s of missing) {
        try {
          const response = await fetch(s.audioUrl);
          if (!response.ok) continue;
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          updates[s.audioUrl] = audioBuffer.duration;
        } catch {
          // skip tracks that fail to load
        }
      }

      if (cancelled) return;

      setEnrichedSamples((prev) =>
        prev.map((s) => {
          const dur = updates[s.audioUrl];
          return dur ? { ...s, duration: dur } : s;
        }),
      );

      ctx.close().catch(() => {});
    })();

    return () => {
      cancelled = true;
      ctx.close().catch(() => {});
    };
  }, [samples]);

  // Derived data
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const s of enrichedSamples) {
      if (s.category && !seen.has(s.category)) {
        seen.add(s.category);
        ordered.push(s.category);
      }
    }
    return ordered;
  }, [enrichedSamples]);

  // State
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0] ?? "",
  );
  const [activeTrackUrl, setActiveTrackUrl] = useState<string | null>(null);
  const [isWaveformPlaying, setIsWaveformPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isWaveformPlaying;

  // Ref to WaveformPlayer for programmatic play/pause
  const waveformRef = useRef<WaveformPlayerHandle | null>(null);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  // Set to true before changing activeTrackUrl via auto-advance so the
  // useEffect below can trigger play() after WaveformPlayer's effects settle
  const autoPlayNextRef = useRef(false);

  // Filtered tracks
  const filteredTracks = useMemo(
    () => enrichedSamples.filter((s) => s.category === activeCategory),
    [enrichedSamples, activeCategory],
  );

  const cancelAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    autoPlayNextRef.current = false;
  }, []);

  // Track-item play/pause handler
  const handlePlayPause = useCallback(
    (track: SampleItem) => {
      cancelAutoAdvance();
      const url = track.audioUrl;

      if (!url) return; // no-audio track — button is disabled anyway

      if (url === activeTrackUrl) {
        // Same track — toggle (read from ref to avoid stale closure)
        if (isPlayingRef.current) {
          waveformRef.current?.pause();
        } else {
          waveformRef.current?.play();
        }
      } else {
        // New track — set URL then play from user gesture context
        setActiveTrackUrl(url);
        // Defer play() until React commits the state update
        // requestAnimationFrame runs after the commit, so ref has new url
        requestAnimationFrame(() => {
          waveformRef.current?.play();
        });
      }
    },
    [activeTrackUrl, cancelAutoAdvance],
  );

  // Waveform playback state callback
  const handlePlayStateChange = useCallback((playing: boolean) => {
    isPlayingRef.current = playing;
    setIsWaveformPlaying(playing);
  }, []);

  // Auto-advance: called by WaveformPlayer when track ends naturally
  const handleTrackEnded = useCallback(() => {
    const currentIdx = filteredTracks.findIndex(
      (t) => t.audioUrl === activeTrackUrl,
    );
    if (currentIdx < 0 || currentIdx >= filteredTracks.length - 1) return;

    const nextTrack = filteredTracks[currentIdx + 1];
    if (!nextTrack.audioUrl) return;

    autoAdvanceTimerRef.current = setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      autoPlayNextRef.current = true;
      setActiveTrackUrl(nextTrack.audioUrl);
    }, 1000);
  }, [filteredTracks, activeTrackUrl]);

  // Pause audio when scrolling away from this section
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          cancelAutoAdvance();
          waveformRef.current?.pause();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [cancelAutoAdvance]);

  // Fires after WaveformPlayer's useEffect([audioUrl]) has already run —
  // React guarantees children effects settle before parent effects.
  // By this point the buffer is cleared and play() will fetch + decode the new track.
  useEffect(() => {
    if (!autoPlayNextRef.current || !activeTrackUrl) return;
    autoPlayNextRef.current = false;
    waveformRef.current?.play();
  }, [activeTrackUrl]);

  // Category tab change — reset track selection
  const handleTabChange = useCallback(
    (cat: string) => {
      cancelAutoAdvance();
      setActiveCategory(cat);
      setActiveTrackUrl(null);
      setIsWaveformPlaying(false);
    },
    [cancelAutoAdvance],
  );

  // Edge case: empty samples
  if (enrichedSamples.length === 0) {
    return (
      <section
        id={id}
        className="snap-start h-dvh flex items-center justify-center p-4 sm:p-6 relative"
      >
        {/* Solid background — full viewport height */}
        <div className="absolute inset-0 bg-blush" aria-hidden="true" />

        <div className="w-full max-w-[min(80vw,700px)] rounded-xl shadow-[3px_8px_30px_rgba(0,0,0,0.12)] border border-[#C9AD86]/20 flex items-center justify-center"
          style={{ maxHeight: "calc(var(--section-h) - 4rem)", minHeight: "18rem", backgroundImage: "url('/assets/textures/rough-paper.jpg')", backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "repeat", backgroundBlendMode: "multiply", backgroundColor: "#F5F0E8" }}
        >
          <span className="font-heading text-xl sm:text-2xl text-text-secondary/35 tracking-widest uppercase">
            Sin samples aún
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      className="snap-start h-dvh flex items-center justify-center p-2 sm:p-4 relative"
    >
      {/* Solid background — full viewport height */}
      <div className="absolute inset-0 bg-blush" aria-hidden="true" />

      <FolderPapers
        categories={categories}
        activeCategory={activeCategory}
        onTabChange={handleTabChange}
      >
        {/* Track list */}
        <TrackList
          tracks={filteredTracks}
          activeTrackUrl={activeTrackUrl}
          isWaveformPlaying={isWaveformPlaying}
          onPlayPause={handlePlayPause}
        />

        {/* Divider above waveform */}
        <div className="h-px bg-[#C9AD86]/15 mx-1 sm:mx-2 shrink-0" />

        {/* Waveform player */}
        <WaveformPlayer
          ref={waveformRef}
          audioUrl={activeTrackUrl}
          onPlayStateChange={handlePlayStateChange}
          onEnded={handleTrackEnded}
        />
      </FolderPapers>

      <SectionTitleOverlay
        imageSrc="/assets/animated/muestras-title.png"
      />
    </section>
  );
}
