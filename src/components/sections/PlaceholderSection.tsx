"use client";

interface PlaceholderSectionProps {
  id: string;
  label: string;
  color?: "sage" | "avocado" | "blush" | "peach" | "oat";
}

const kraftColorMap: Record<string, string> = {
  sage: "kraft-sage",
  avocado: "kraft-avocado",
  blush: "kraft-blush",
  peach: "kraft-peach",
  oat: "kraft-oat",
};

export default function PlaceholderSection({ id, label, color = "blush" }: PlaceholderSectionProps) {
  const kraftClass = kraftColorMap[color] || "kraft-blush";

  return (
    <section id={id} className="snap-start h-dvh flex items-center justify-center p-4 sm:p-6">
      <div
        className={`w-full max-w-[min(80vw,700px)] rounded-b-xl rounded-tr-xl shadow-[3px_8px_30px_rgba(0,0,0,0.12)] border border-[#C9AD86]/20 kraft-texture ${kraftClass} flex items-center justify-center`}
        style={{ aspectRatio: "1.5 / 1", maxHeight: "calc(var(--section-h) - 4rem)" }}
      >
        <span className="font-heading text-2xl sm:text-3xl md:text-4xl text-text-secondary/35 tracking-widest uppercase">
          Próximamente
        </span>
      </div>
    </section>
  );
}
