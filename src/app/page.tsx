import type { Metadata } from "next";
import LandingContent from "./LandingContent";
import JsonLd from "@/components/seo/JsonLd";
import { fetchLandingContent } from "@/lib/content";
import landingData from "@/lib/landing-data";
import { SITE_URL } from "@/lib/site";

// Content changes rarely and is edited in Sanity, so the page is rebuilt on a
// timer rather than on every request. Crawlers still get fully rendered HTML.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await fetchLandingContent();
  const name = profile?.name || landingData.name;
  const role = profile?.role || landingData.role;

  return {
    title: `${name} — ${role}`,
    description: `Portfolio de ${name}, ${role}. Demos, muestras de voz y trabajos de locución, doblaje y publicidad.`,
  };
}

export default async function Home() {
  const content = await fetchLandingContent();
  const name = content.profile?.name || landingData.name;
  const role = content.profile?.role || landingData.role;
  const bio = content.profile?.bio || landingData.bioFallback;

  return (
    <>
      <JsonLd
        name={name}
        role={role}
        bio={bio}
        picture={content.profile?.picture ?? null}
        social={content.social}
        siteUrl={SITE_URL}
      />
      <LandingContent {...content} />
    </>
  );
}
