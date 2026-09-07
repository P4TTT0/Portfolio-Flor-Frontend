/**
 * Extract YouTube video ID from various URL formats.
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch[^#]*[?&]v=([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Get YouTube thumbnail URL for a video ID.
 * Uses hqdefault (480x360) — always available, no API key needed.
 *
 * Note this is a 4:3 frame: YouTube letterboxes 16:9 video into it, so the
 * image carries black bars top and bottom. Cropping it with `object-cover`
 * inside a 16:9 box removes exactly those bars.
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Get the high-resolution thumbnail (1280x720, true 16:9 with no letterboxing).
 * Not generated for every video, so callers must fall back to
 * `getYouTubeThumbnail` when it 404s.
 */
export function getYouTubeThumbnailHd(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Get YouTube embed URL for iframe.
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&enablejsapi=1`;
}
