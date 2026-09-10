"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// ---------------------------------------------------------------------------
// Public types & helpers
// ---------------------------------------------------------------------------

export interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  peaks: number[]; // normalised 0–1 amplitude values
  volume: number; // 0–1, reads 0 while muted
  isMuted: boolean;
  play: () => void;
  pause: () => void;
  seek: (fraction: number) => void;
  setVolume: (v: number) => void;
  /** Silences output and back, remembering the level to restore. */
  toggleMute: () => void;
  loading: boolean;
  error: string | null;
}

/** Number of waveform bars to compute */
export const PEAK_BUCKETS = 100;

/** Format seconds to mm:ss (or "--:--" when invalid) */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/** Compute normalised peak amplitudes from an AudioBuffer. */
export function computePeaks(buffer: AudioBuffer, buckets: number): number[] {
  const channelData = buffer.getChannelData(0);
  const bucketSize = Math.floor(channelData.length / buckets);
  const peaks: number[] = [];

  for (let i = 0; i < buckets; i++) {
    const start = i * bucketSize;
    let max = 0;
    for (let j = 0; j < bucketSize; j++) {
      const abs = Math.abs(channelData[start + j]);
      if (abs > max) max = abs;
    }
    peaks.push(max);
  }

  return peaks;
}

// ---------------------------------------------------------------------------
// Module-level cache — peaks survive across hook instances
// ---------------------------------------------------------------------------

const peaksCache = new Map<string, number[]>();

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAudioPlayer(audioUrl: string, onEnded?: () => void): UseAudioPlayerReturn {
  const onEndedRef = useRef(onEnded);
  // Assigned in an effect, not during render: a render can be started and then
  // thrown away (StrictMode, a concurrent re-render), and mutating a ref on that
  // discarded pass leaves it holding a value that was never committed. Every
  // reader below runs from a timer or an event handler, i.e. after commit, so
  // updating here is soon enough.
  useEffect(() => {
    onEndedRef.current = onEnded;
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const isPlayingRef = useRef(false);
  const volumeRef = useRef(0.8);
  /** Level to come back to when unmuting — never overwritten with 0. */
  const lastAudibleVolumeRef = useRef(0.8);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [peaks, setPeaks] = useState<number[]>(() => peaksCache.get(audioUrl) ?? []);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React's documented way to reset state when an input changes: adjust it
  // during render rather than from an effect. The effect version needs a second
  // render pass, and between the two the UI paints one frame still showing the
  // PREVIOUS track's duration and waveform. Peaks are seeded from the cache in
  // the same pass, so returning to an already-decoded track draws its waveform
  // with no flash of an empty one.
  //
  // The effect below keeps the parts that are genuinely side effects: tearing
  // down the audio graph and fetching/decoding the new file.
  const [loadedUrl, setLoadedUrl] = useState(audioUrl);
  if (loadedUrl !== audioUrl) {
    setLoadedUrl(audioUrl);
    setDuration(0);
    setPeaks(peaksCache.get(audioUrl) ?? []);
    setIsPlaying(false);
    setCurrentTime(0);
  }

  // --- helpers ---

  const stopSource = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {
        /* already stopped — safe to ignore */
      }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
  }, []);

  const getCtx = useCallback((): AudioContext | null => {
    if (audioContextRef.current) return audioContextRef.current;
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioContextRef.current = new Ctor();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volumeRef.current;
      gainNodeRef.current.connect(audioContextRef.current.destination);
      return audioContextRef.current;
    } catch {
      setError("Tu navegador no soporta reproducción de audio.");
      return null;
    }
  }, []);

  const loadAudio = useCallback(
    async (ctx: AudioContext): Promise<boolean> => {
      // Serve cached peaks immediately if available
      if (peaksCache.has(audioUrl)) {
        setPeaks(peaksCache.get(audioUrl)!);
      }

      setLoading(true);
      try {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        bufferRef.current = audioBuffer;
        setDuration(audioBuffer.duration);

        if (!peaksCache.has(audioUrl)) {
          const computed = computePeaks(audioBuffer, PEAK_BUCKETS);
          peaksCache.set(audioUrl, computed);
          setPeaks(computed);
        }

        setError(null);
        return true;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Error al cargar audio: ${msg}`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [audioUrl],
  );

  // --- public API ---

  const play = useCallback(async () => {
    // Guard: prevent double-execution during async loadAudio
    if (isPlayingRef.current) return;

    const ctx = getCtx();
    if (!ctx) return;

    stopSource();

    if (!bufferRef.current) {
      const ok = await loadAudio(ctx);
      if (!ok) return;
    }

    // Re-check guard after await (another play() could have started)
    if (isPlayingRef.current) return;

    const buffer = bufferRef.current;
    if (!buffer) return;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNodeRef.current!);

    const offset = pauseOffsetRef.current;
    source.start(0, offset);
    startTimeRef.current = ctx.currentTime - offset;

    isPlayingRef.current = true;

    source.onended = () => {
      if (sourceNodeRef.current === source) {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setCurrentTime(0);
        pauseOffsetRef.current = 0;
        sourceNodeRef.current = null;
        onEndedRef.current?.();
      }
    };

    sourceNodeRef.current = source;
    setIsPlaying(true);

    const tick = () => {
      if (!audioContextRef.current) return;
      const elapsed =
        audioContextRef.current.currentTime - startTimeRef.current;
      setCurrentTime(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [getCtx, stopSource, loadAudio]);

  const pause = useCallback(() => {
    if (!audioContextRef.current || !sourceNodeRef.current) return;
    pauseOffsetRef.current =
      audioContextRef.current.currentTime - startTimeRef.current;
    isPlayingRef.current = false;
    stopSource();
    setIsPlaying(false);
    setCurrentTime(pauseOffsetRef.current);
  }, [stopSource]);

  const seek = useCallback(
    (fraction: number) => {
      const clamped = Math.max(0, Math.min(1, fraction));
      const buffer = bufferRef.current;
      const seekTime = buffer ? clamped * buffer.duration : 0;

      pauseOffsetRef.current = seekTime;
      setCurrentTime(seekTime);

      if (isPlaying) {
        stopSource();
        const ctx = audioContextRef.current;
        if (!ctx || !buffer) return;

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(gainNodeRef.current!);
        source.start(0, seekTime);
        startTimeRef.current = ctx.currentTime - seekTime;

        source.onended = () => {
          if (sourceNodeRef.current === source) {
            isPlayingRef.current = false;
            setIsPlaying(false);
            setCurrentTime(0);
            pauseOffsetRef.current = 0;
            sourceNodeRef.current = null;
            onEndedRef.current?.();
          }
        };

        sourceNodeRef.current = source;
        isPlayingRef.current = true;

        const tick = () => {
          if (!audioContextRef.current) return;
          const elapsed =
            audioContextRef.current.currentTime - startTimeRef.current;
          setCurrentTime(elapsed);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [isPlaying, stopSource],
  );

  // --- pre-load metadata when URL changes (duration + peaks only, no loading state) ---

  useEffect(() => {
    if (!audioUrl) {
      bufferRef.current = null;
      return;
    }

    // Tear down the previous track's audio graph. The React state that goes
    // with it was already reset during render, above.
    stopSource();
    pauseOffsetRef.current = 0;
    isPlayingRef.current = false;
    bufferRef.current = null; // clear old buffer so play() triggers loadAudio

    let cancelled = false;

    // `getCtx()` reports unsupported browsers through `setError`, so calling it
    // straight from the effect body is a synchronous setState during an effect.
    // Moving it inside the async block defers that, and it also means the
    // cleanup below is always registered — the early return used to skip it.
    (async () => {
      const ctx = getCtx();
      if (!ctx) return;

      try {
        const response = await fetch(audioUrl);
        if (!response.ok) return;
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        if (cancelled) return;

        // Store buffer so play() can reuse it without re-fetching
        bufferRef.current = audioBuffer;
        setDuration(audioBuffer.duration);

        if (!peaksCache.has(audioUrl)) {
          const computed = computePeaks(audioBuffer, PEAK_BUCKETS);
          peaksCache.set(audioUrl, computed);
          setPeaks(computed);
        }

        setError(null);
      } catch {
        if (cancelled) return;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [audioUrl, getCtx, stopSource]);

  /**
   * Push a level to the gain node. Stepping gain discontinuously produces an
   * audible click ("zipper noise"), so when the graph is live the change is
   * ramped over a few milliseconds instead of assigned.
   */
  const applyVolume = useCallback((v: number) => {
    volumeRef.current = v;
    setVolumeState(v);

    const gain = gainNodeRef.current;
    const ctx = audioContextRef.current;
    if (!gain) return;

    if (ctx) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(v, now + 0.04);
    } else {
      gain.gain.value = v;
    }
  }, []);

  const setVolume = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(1, v));
      // Moving the slider is an explicit choice about level: it overrides mute,
      // and any audible level becomes the one the mute toggle restores.
      if (clamped > 0) lastAudibleVolumeRef.current = clamped;
      setIsMuted(clamped === 0);
      applyVolume(clamped);
    },
    [applyVolume],
  );

  const toggleMute = useCallback(() => {
    if (isMuted || volumeRef.current === 0) {
      applyVolume(lastAudibleVolumeRef.current || 0.8);
      setIsMuted(false);
      return;
    }
    lastAudibleVolumeRef.current = volumeRef.current;
    setIsMuted(true);
    applyVolume(0);
  }, [isMuted, applyVolume]);

  // --- lifecycle ---

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      stopSource();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [stopSource]);

  return {
    isPlaying,
    currentTime,
    duration,
    peaks,
    volume,
    isMuted,
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    loading,
    error,
  };
}
