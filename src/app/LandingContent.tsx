"use client";

import { useRef } from "react";
import { useSanityContent } from "@/lib/use-sanity-content";
import landingData from "@/lib/landing-data";
import BioSection from "@/components/sections/BioSection";
import DemosSection from "@/components/sections/DemosSection";
import PlaceholderSection from "@/components/sections/PlaceholderSection";
import SamplesSection from "@/components/sections/SamplesSection";
import SocialSection from "@/components/sections/SocialSection";
import SectionNav from "@/components/sections/SectionNav";

export default function LandingContent() {
  const containerRef = useRef<HTMLElement>(null);
  const { profile, demos, samples, social, loading } = useSanityContent();

  const name = profile?.name || landingData.name;
  const role = profile?.role || landingData.role;
  const bio = profile?.bio || landingData.folders.find((f) => f.id === "bio")?.content || "";
  const picture = profile?.picture;

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <span className="font-heading text-xl text-text-secondary/50 tracking-widest">
          Cargando...
        </span>
      </div>
    );
  }

  return (
    <>
      <main
        ref={containerRef}
        className="snap-y snap-mandatory h-dvh overflow-y-auto overflow-x-hidden"
      >
        <BioSection id="bio" name={name} role={role} bio={bio} picture={picture} />
        <DemosSection id="demos" demos={demos} />
        <SamplesSection id="samples" samples={samples} />
        <PlaceholderSection id="works" label="Works" color="peach" />
        <SocialSection id="social" social={social} />
      </main>
      <SectionNav containerRef={containerRef} />
    </>
  );
}
