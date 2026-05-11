"use client";

import { useRef } from "react";
import { useSanityContent } from "@/lib/use-sanity-content";
import landingData from "@/lib/landing-data";
import HeroSection from "@/components/sections/HeroSection";
import DemosSection from "@/components/sections/DemosSection";
import PlaceholderSection from "@/components/sections/PlaceholderSection";
import SectionNav from "@/components/sections/SectionNav";

export default function LandingContent() {
  const containerRef = useRef<HTMLElement>(null);
  const { profile, demos, social, loading } = useSanityContent();

  const name = profile?.name || landingData.name;
  const role = profile?.role || landingData.role;
  const bio = profile?.bio || landingData.folders.find((f) => f.id === "bio")?.content || "";
  const picture = profile?.picture;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="font-heading text-xl text-text-secondary/50 tracking-widest">
          Cargando...
        </span>
      </div>
    );
  }

  const sectionIds = ["hero", "demos", "samples", "works"];
  const sectionLabels = ["Inicio", "Demos", "Samples", "Works"];

  return (
    <>
      <main
        ref={containerRef}
        className="snap-y snap-mandatory h-screen overflow-y-auto overflow-x-hidden"
      >
        <HeroSection
          id="hero"
          name={name}
          role={role}
          bio={bio}
          picture={picture}
          social={social}
        />
        <DemosSection id="demos" demos={demos} />
        <PlaceholderSection id="samples" label="Samples" color="blush" />
        <PlaceholderSection id="works" label="Works" color="peach" />
      </main>
      <SectionNav
        containerRef={containerRef}
        sectionIds={sectionIds}
        labels={sectionLabels}
      />
    </>
  );
}
