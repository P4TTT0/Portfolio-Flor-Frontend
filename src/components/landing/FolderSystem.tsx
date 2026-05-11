"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { FolderData } from "@/lib/landing-data";
import type { DemoItem } from "@/lib/use-sanity-content";
import type { SocialItem } from "@/lib/use-sanity-content";
import Folder from "./Folder";

interface FolderSystemProps {
  folders: FolderData[];
  demos: DemoItem[];
  social: SocialItem[];
  bioPicture?: string | null;
}

export default function FolderSystem({ folders, demos, social, bioPicture }: FolderSystemProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelTimeoutRef.current) return;

      if (e.deltaY > 15) {
        setActiveIndex((prev) => Math.min(prev + 1, folders.length - 1));
      } else if (e.deltaY < -15) {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }

      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 500);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [folders.length]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-end justify-center pt-4 pb-2"
      aria-label="Portfolio folders"
    >
      {/* Background rotated folders */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-end justify-center pt-4 pb-2">
        {folders.map((folder, index) => {
          if (index === activeIndex) return null;
          const distance = (index - activeIndex + folders.length) % folders.length;
          if (distance > 2) return null;

          const rotation = distance === 1 ? 4 : -4;
          const yOffset = distance * 8;
          const opacity = distance === 1 ? 0.3 : 0.12;
          const scale = distance === 1 ? 0.96 : 0.92;
          const kraftClass = folder.folderColor === "sage" ? "kraft-sage"
            : folder.folderColor === "avocado" ? "kraft-avocado"
            : folder.folderColor === "blush" ? "kraft-blush"
            : folder.folderColor === "peach" ? "kraft-peach"
            : "kraft-oat";

          return (
            <div
              key={`bg-${folder.id}`}
              className={`absolute rounded-xl kraft-texture ${kraftClass}`}
              style={{
                opacity,
                transform: `rotate(${rotation}deg) translateY(${yOffset}px) scale(${scale})`,
                zIndex: 5 + distance,
                width: "min(80vw, 750px)",
                aspectRatio: "1.5 / 1",
              }}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {/* Active folder */}
      <div
        className="relative z-10 w-full max-w-[min(80vw,750px)]"
        style={{ aspectRatio: "1.5 / 1", maxHeight: "calc(100% - 3rem)" }}
      >
        {folders.map((folder, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={folder.id}
              className="absolute inset-0 transition-all duration-500 ease-in-out"
              style={{
                zIndex: isActive ? 20 : 1,
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
              }}
            >
              <Folder
                folder={folder}
                onSelect={handleSelect}
                allFolders={folders}
                activeIndex={activeIndex}
                demos={folder.id === "demos" ? demos : undefined}
                social={folder.id === "social" ? social : undefined}
                bioPicture={folder.id === "bio" ? bioPicture : undefined}
                bioOverflow={folder.id === "bio"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
