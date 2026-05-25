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
  volume: number; // 0–1
  play: () => void;
  pause: () => void;
  seek: (fraction: number) => void;
  setVolume: (v: number) => void;
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

export function useAudioPlayer(audioUrl: string): UseAudioPlayerReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const isPlayingRef = useRef(false);
  const volumeRef = useRef(0.8);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [volume, setVolumeState] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setDuration(0);
      setPeaks([]);
      bufferRef.current = null;
      return;
    }

    // Reset playback state when URL changes
    stopSource();
    setIsPlaying(false);
    setCurrentTime(0);
    pauseOffsetRef.current = 0;
    isPlayingRef.current = false;
    bufferRef.current = null; // clear old buffer so play() triggers loadAudio

    // Serve cached peaks immediately if available
    if (peaksCache.has(audioUrl)) {
      setPeaks(peaksCache.get(audioUrl)!);
    }

    let cancelled = false;
    const ctx = getCtx();
    if (!ctx) return;

    (async () => {
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

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    volumeRef.current = clamped;
    setVolumeState(clamped);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clamped;
    }
  }, []);

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
    play,
    pause,
    seek,
    setVolume,
    loading,
    error,
  };
}
