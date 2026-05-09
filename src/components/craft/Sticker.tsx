import type { ReactNode } from "react";

interface StickerProps {
  children: ReactNode;
  rotation?: number;
  className?: string;
}

export default function Sticker({
  children,
  rotation = 0,
  className = "",
}: StickerProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full
        bg-cream/90 shadow-[0_2px_6px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)]
        border border-cream/60
        animate-[gentle-float_4s_ease-in-out_infinite] ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        willChange: "transform",
      }}
    >
      {children}
    </span>
  );
}
