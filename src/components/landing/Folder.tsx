"use client";

import type { FolderData } from "@/lib/landing-data";
import type { DemoItem } from "@/lib/use-sanity-content";
import DemoCard from "@/components/demos/DemoCard";

interface FolderProps {
  folder: FolderData;
  onSelect: (index: number) => void;
  allFolders: FolderData[];
  activeIndex: number;
  demos?: DemoItem[];
}

const kraftColorMap: Record<string, string> = {
  sage: "kraft-sage",
  avocado: "kraft-avocado",
  blush: "kraft-blush",
  peach: "kraft-peach",
  oat: "kraft-oat",
};

export default function Folder({ folder, onSelect, allFolders, activeIndex, demos }: FolderProps) {
  const hasContent = folder.content && folder.content.trim().length > 0;
  const kraftClass = kraftColorMap[folder.folderColor] || "kraft-oat";
  const isDemosFolder = folder.id === "demos" && demos && demos.length > 0;

  return (
    <div className="relative w-full h-full">
      {/* === FOLDER BODY === */}
      <div
        className={`w-full h-full rounded-b-xl rounded-tr-xl shadow-[3px_8px_30px_rgba(0,0,0,0.12),inset_0_0_40px_rgba(255,255,255,0.05)] border border-[#C9AD86]/20 kraft-texture ${kraftClass} flex flex-col`}
      >
        <div className={`flex-1 px-6 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10 flex flex-col ${isDemosFolder ? "overflow-y-auto" : ""}`}>
          <h2 className="font-heading text-lg sm:text-xl md:text-2xl text-text-primary/70 mb-3 sm:mb-5 tracking-tight shrink-0">
            {folder.label}
          </h2>

          {/* Demos: render DemoCards */}
          {isDemosFolder ? (
            <div className="flex flex-wrap gap-4 sm:gap-5 md:gap-6 justify-center content-start pt-2">
              {demos.map((demo) => (
                <DemoCard key={demo.title} demo={demo} />
              ))}
            </div>
          ) : hasContent ? (
            <p className="font-body text-sm sm:text-base md:text-lg text-text-secondary leading-relaxed">
              {folder.content}
            </p>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <span className="font-heading text-lg sm:text-xl md:text-2xl text-text-secondary/35 tracking-widest uppercase">
                Proximamente
              </span>
            </div>
          )}
        </div>
      </div>

      {/* === TABS === */}
      <div className="absolute bottom-full left-0 flex items-end z-30" role="tablist" aria-label="Folder tabs">
        {allFolders.map((f, idx) => {
          const isActive = idx === activeIndex;
          const tabKraft = kraftColorMap[f.folderColor] || "kraft-oat";
          const zIndex = idx < activeIndex ? 15 : idx === activeIndex ? 25 : 5;

          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelect(idx)}
              className={`
                relative px-4 sm:px-5 md:px-7 py-2 sm:py-2.5 md:py-3
                font-heading text-sm sm:text-base md:text-lg font-semibold tracking-wide
                border-0 cursor-pointer
                transition-all duration-300 ease-out
                rounded-t-lg
                kraft-texture ${tabKraft}
                ${isActive
                  ? "text-text-primary"
                  : "text-text-primary/40 hover:text-text-primary/60"
                }
              `}
              style={{
                zIndex,
                marginLeft: idx > 0 ? "-8px" : "0",
                boxShadow: isActive
                  ? "none"
                  : "0 -2px 6px rgba(0,0,0,0.12), inset 0 -1px 2px rgba(0,0,0,0.06)",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
