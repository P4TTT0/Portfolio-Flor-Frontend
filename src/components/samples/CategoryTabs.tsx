"use client";

// ---------------------------------------------------------------------------
// CategoryTabs — two sticky-note style tabs at opposite edges
// ---------------------------------------------------------------------------

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onTabChange: (category: string) => void;
}

const KRAFT_COLORS = ["#d4d8c4", "#e8ddd8"] as const;

export default function CategoryTabs({
  categories,
  activeCategory,
  onTabChange,
}: CategoryTabsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex justify-between items-start px-1 sm:px-2 pt-1 shrink-0">
      {categories.map((cat, i) => {
        const isActive = cat === activeCategory;
        const rotation = i === 0 ? -2.5 : 2.5;

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onTabChange(cat)}
            className={`
              relative px-4 sm:px-5 py-1.5 sm:py-2
              font-heading text-xs sm:text-sm font-semibold tracking-wide
              border-0 cursor-pointer
              transition-all duration-200 shadow-[1px_2px_6px_rgba(0,0,0,0.08)]
              ${
                isActive
                  ? "text-text-primary scale-105 z-10"
                  : "text-text-secondary/60 hover:text-text-secondary/80 opacity-75"
              }
            `}
            style={{
              background: KRAFT_COLORS[i % KRAFT_COLORS.length],
              transform: `rotate(${rotation}deg)${isActive ? " scale(1.05)" : ""}`,
              borderRadius: "2px 2px 8px 2px",
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
