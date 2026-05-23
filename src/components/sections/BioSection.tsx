"use client";

import Header from "@/components/landing/Header";
import BioCard from "@/components/bio/BioCard";

interface BioSectionProps {
  id: string;
  name: string;
  role: string;
  bio: string;
  picture?: string | null;
}

export default function BioSection({ id, name, role, bio, picture }: BioSectionProps) {
  return (
    <section id={id} className="snap-start h-screen flex flex-col">
      <Header name={name} role={role} />
      <div className="flex-1 flex items-center justify-center min-h-0 px-2 sm:px-4 pb-4">
        <div className="relative w-full max-w-[min(85vw,800px)] flex items-center justify-center" style={{ height: "80%", minHeight: 300 }}>
          <BioCard bio={bio} picture={picture} />
        </div>
      </div>
    </section>
  );
}
