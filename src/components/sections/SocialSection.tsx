"use client";

import type { SocialItem } from "@/lib/use-sanity-content";
import SocialCard from "@/components/social/SocialCard";

interface SocialSectionProps {
  id: string;
  social: SocialItem[];
}

export default function SocialSection({ id, social }: SocialSectionProps) {
  return (
    <section id={id} className="snap-start h-screen flex items-center justify-center px-2 sm:px-4">
      <div className="relative w-full max-w-[min(85vw,800px)]" style={{ aspectRatio: "1.5 / 1", maxHeight: "calc(100vh - 6rem)" }}>
        <div className="relative w-full h-full">

          <div className="absolute bottom-full left-0 flex items-end z-30" role="tablist" aria-label="Folder tabs">
            <button
              type="button"
              role="tab"
              aria-selected
              tabIndex={0}
              className="relative px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 font-heading text-sm sm:text-base md:text-lg font-semibold tracking-wide border-0 cursor-pointer text-text-primary"
              style={{
                zIndex: 25,
                boxShadow: "none",
                borderRadius: "10px 10px 0 0",
                background: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(139, 119, 90, 0.04) 2px,
                    rgba(139, 119, 90, 0.04) 4px
                  ),
                  #e4ddd2
                `,
              }}
            >
              Redes sociales
            </button>
          </div>

          <div
            className="w-full h-full rounded-b-xl rounded-tr-xl shadow-[3px_8px_30px_rgba(0,0,0,0.12)] border border-[#C9AD86]/20 border-t-0 flex flex-col"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(139, 119, 90, 0.04) 2px,
                  rgba(139, 119, 90, 0.04) 4px
                ),
                #e4ddd2
              `,
            }}
          >
            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto folder-scroll p-3 sm:p-4">
              <div className="flex flex-wrap gap-2.5 sm:gap-3 md:gap-4 justify-start content-start">
                {social.map((s, i) => (
                  <div key={s.platform || i} className="w-[calc((100%-1.25rem)/3)] sm:w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-2rem)/3)]">
                    <SocialCard social={s} index={i} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
