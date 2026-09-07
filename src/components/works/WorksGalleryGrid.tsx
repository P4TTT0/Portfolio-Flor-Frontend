"use client";

import useBreakpoint from "@/hooks/useBreakpoint";
import WorkGalleryTile from "@/components/works/WorkGalleryTile";
import type { WorkItem } from "@/lib/use-sanity-content";

interface WorksGalleryGridProps {
  works: WorkItem[];
  onPlay: (index: number) => void;
}

const GAP = 12;

const COLUMNS = { mobile: 2, tablet: 3, desktop: 4 } as const;

/**
 * A tile at the edge of the grid would be clipped by the scroll container when
 * it scales, so it grows inward instead of from its centre. Only the mid-scroll
 * case is left uncovered, and that one cannot be known from the index.
 */
function transformOrigin(
  index: number,
  columns: number,
  total: number,
): string {
  const column = index % columns;
  const row = Math.floor(index / columns);
  const lastRow = Math.floor((total - 1) / columns);

  const x =
    column === 0 ? "left" : column === columns - 1 ? "right" : "center";
  const y = row === 0 ? "top" : row === lastRow ? "bottom" : "center";

  return `${x} ${y}`;
}

export default function WorksGalleryGrid({
  works,
  onPlay,
}: WorksGalleryGridProps) {
  const { breakpoint } = useBreakpoint();
  const columns = COLUMNS[breakpoint];

  return (
    // The column count drives both the tracks and the transform origins, so it
    // has to come from one place — Tailwind's own breakpoints would disagree
    // with the hook's by a pixel at the boundaries.
    <div
      className="grid"
      style={{
        gap: GAP,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {works.map((work, index) => (
        <WorkGalleryTile
          key={work.title + index}
          work={work}
          transformOrigin={transformOrigin(index, columns, works.length)}
          onPlay={() => onPlay(index)}
        />
      ))}
    </div>
  );
}
