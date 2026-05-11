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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [profileResult, demosResult, samplesResult, socialResult] = await Promise.all([
          // Profile - fetch all fields including picture
          client.fetch(`*[_type == "profile"][0] { name, role, bio, "picture": picture.asset->url }`),
          // Demos
          client.fetch<DemoItem[]>(`*[_type == "demo"] | order(_createdAt desc) { title, category, videoUrl }`),
          // Samples
          client.fetch<SampleItem[]>(`*[_type == "sample"] | order(_createdAt desc) { title, category }`),
          // Social
          client.fetch<SocialItem[]>(`*[_type == "profile"][0].social[] { platform, url, username, description }`),
        ]);

        console.log("[Sanity] Profile:", JSON.stringify(profileResult, null, 2));
        console.log("[Sanity] Demos:", demosResult);
        console.log("[Sanity] Samples:", samplesResult);
        console.log("[Sanity] Social:", socialResult);

        if (!cancelled) {
          setProfile(profileResult ? {
            name: profileResult.name || null,
            role: profileResult.role || null,
            bio: profileResult.bio || null,
            picture: profileResult.picture || null,
          } : null);
          setDemos(demosResult || []);
          setSamples(samplesResult || []);
          setSocial(socialResult || []);
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

  return { profile, demos, samples, social, loading };
}
