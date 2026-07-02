import { useEffect, useState } from "react";
import { client } from "@/lib/sanity";

export interface DemoItem {
  title: string;
  category: string;
  videoUrl: string;
}

export interface SampleItem {
  title: string;
  category: string;
  audioUrl: string;
  duration?: number;
}

export interface WorkItem {
  title: string;
  category: string;
  country: string;
  youtubeUrl: string;
}

export interface SocialItem {
  platform: string;
  url: string;
  username: string;
  description: string;
}

export interface ProfileData {
  name: string;
  role: string;
  bio: string | null;
  picture: string | null;
}

export function useSanityContent() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [demos, setDemos] = useState<DemoItem[]>([]);
  const [samples, setSamples] = useState<SampleItem[]>([]);
  const [social, setSocial] = useState<SocialItem[]>([]);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [profileResult, demosResult, samplesResult, socialResult, worksResult] = await Promise.all([
          // Profile - fetch all fields including picture
          client.fetch(`*[_type == "profile"][0] { name, role, bio, "picture": picture.asset->url }`),
          // Demos
          client.fetch<DemoItem[]>(`*[_type == "demo"] | order(_createdAt desc) { title, category, videoUrl }`),
          // Samples
          client.fetch<SampleItem[]>(`*[_type == "sample"] | order(_createdAt desc) { title, category, "audioUrl": audioFile.asset->url, duration }`),
          // Social
          client.fetch<SocialItem[]>(`*[_type == "profile"][0].social[] { platform, url, username, description }`),
          // Works
          client.fetch<WorkItem[]>(`*[_type == "work"] | order(_createdAt desc) { title, category, country, youtubeUrl }`),
        ]);

        if (!cancelled) {
          setProfile(profileResult ? {
            name: profileResult.name || null,
            role: profileResult.role || null,
            bio: profileResult.bio || null,
            picture: profileResult.picture || null,
          } : null);
          setDemos(demosResult || []);
          setSamples((samplesResult || []).map((s) => ({
            ...s,
            audioUrl: s.audioUrl || "",
          })));
          setSocial(socialResult || []);
          setWorks(worksResult || []);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[Sanity] Fetch error:", msg);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAll();
    return () => { cancelled = true };
  }, []);

  return { profile, demos, samples, social, works, loading };
}
