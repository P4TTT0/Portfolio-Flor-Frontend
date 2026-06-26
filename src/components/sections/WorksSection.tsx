import SectionTitleOverlay from "@/components/ui/SectionTitleOverlay";

interface WorksSectionProps {
  id: string;
}

export default function WorksSection({ id }: WorksSectionProps) {
  return (
    <section
      id={id}
      className="snap-start h-dvh flex items-center justify-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-oat" aria-hidden="true" />

      <p className="relative font-heading text-2xl sm:text-3xl md:text-4xl text-text-secondary/40 tracking-widest uppercase">
        Próximamente
      </p>

      <SectionTitleOverlay imageSrc="/assets/animated/trabajos-title.png" />
    </section>
  );
}
