"use client";

import Header from "@/components/landing/Header";
import FolderSystem from "@/components/landing/FolderSystem";
import { useProfile } from "@/lib/use-profile";
import { useSanityContent } from "@/lib/use-sanity-content";
import landingData from "@/lib/landing-data";

export default function LandingContent() {
  const { data: profileHeader, loading: profileLoading } = useProfile();
  const { profile, demos, social, loading: contentLoading } = useSanityContent();

  const name = profileHeader?.name || profile?.name || landingData.name;
  const role = profileHeader?.role || profile?.role || landingData.role;

  // Build folders with real Sanity content, fallback to mock
  const folders = landingData.folders.map((f) => {
    if (f.id === "bio" && profile?.bio) {
      return { ...f, content: profile.bio, picture: profile.picture };
    }
    return f;
  });

  if (profileLoading || contentLoading) {
    return (
      <div className="h-screen overflow-hidden flex items-center justify-center">
        <span className="font-heading text-xl text-text-secondary/50 tracking-widest">
          Cargando...
        </span>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header name={name} role={role} />

      <main className="flex-1 min-h-0 px-1 sm:px-2 pb-2 flex items-end justify-center max-h-[calc(100vh-160px)]">
        <FolderSystem folders={folders} demos={demos} social={social} bioPicture={profile?.picture} />
      </main>
    </div>
  );
}
