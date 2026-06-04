"use client";

import Clip from "@/components/craft/Clip";

// ---------------------------------------------------------------------------
// Notebook — watercolor paper sheet with binder-clip decoration
// ---------------------------------------------------------------------------

interface NotebookProps {
  children: React.ReactNode;
}

export default function Notebook({ children }: NotebookProps) {
  return (
    <div className="relative w-full max-w-[min(80vw,700px)]">
      {/* Section wrapper — constrains height to fit snap-scroll section */}
      <div
        className="relative rounded-xl shadow-[3px_8px_30px_rgba(0,0,0,0.12)] border border-[#C9AD86]/15 flex flex-col overflow-hidden"
        style={{
          maxHeight: "calc(var(--section-h) - 6rem)",
          minHeight: "min(28rem, calc(var(--section-h) - 6rem))",
          backgroundColor: "#F5F0E8",
        }}
      >
        {/* Rough paper texture overlay — reduced opacity for subtle blend */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: "url('/assets/textures/rough-paper.jpg')",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "repeat",
            opacity: 0.5,
          }}
        />
        {/* Binder clip — centred at top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[75%] z-20 pointer-events-none"
          aria-hidden="true"
        >
          <Clip type="binder" color="#6B6B6B" className="w-8 h-auto sm:w-10" />
        </div>

        {/* Content area */}
        <div className="relative z-10 flex flex-col flex-1 min-h-0 pt-2 px-4 sm:px-6 pb-4 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
