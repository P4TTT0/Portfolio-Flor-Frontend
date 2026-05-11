"use client";

import type { SocialItem } from "@/lib/use-sanity-content";
import Header from "@/components/landing/Header";
import BioCard from "@/components/bio/BioCard";
import SocialCard from "@/components/social/SocialCard";

interface HeroSectionProps {
  id: string;
  name: string;
  role: string;
  bio: string;
  picture?: string | null;
  social: SocialItem[];
}

export default function HeroSection({ id, name, role, bio, picture, social }: HeroSectionProps) {
  return (
    <section id={id} className="snap-start h-screen flex flex-col">
      <Header name={name} role={role} />

      <div className="flex-1 flex flex-col md:flex-row min-h-0 px-2 sm:px-4 pb-3 gap-2 md:gap-4">
        <div className="relative flex flex-col w-full md:w-1/2 flex-1 md:flex-none min-h-0">
          <BioCard bio={bio} picture={picture} />
        </div>

        <div className="w-full md:w-1/2 flex-1 md:flex-none min-h-0 rounded-b-xl rounded-tr-xl shadow-[3px_8px_30px_rgba(0,0,0,0.12)] border border-[#C9AD86]/20 kraft-texture kraft-oat flex flex-col">
          <div className="p-3 sm:p-4 flex-1 flex flex-col min-h-0">
            <h2 className="font-heading text-lg sm:text-xl text-text-primary/70 mb-3 tracking-tight shrink-0">
              Social
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 auto-rows-max content-start flex-1">
              {social.map((s, i) => (
                <SocialCard key={s.platform || i} social={s} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
