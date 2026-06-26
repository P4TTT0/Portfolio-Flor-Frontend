"use client";

/**
 * Simple event bus for Lenis Snap → SectionNav communication.
 * Avoids React context overhead for a single producer/consumer pair.
 */

type Listener = (sectionId: string) => void;

const listeners = new Set<Listener>();

export function emitActiveSection(sectionId: string) {
  listeners.forEach((fn) => fn(sectionId));
}

export function subscribeActiveSection(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
