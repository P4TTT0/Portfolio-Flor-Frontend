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

export interface LandingContentData {
  profile: ProfileData | null;
  demos: DemoItem[];
  samples: SampleItem[];
  social: SocialItem[];
  works: WorkItem[];
}

const EMPTY: LandingContentData = {
  profile: null,
  demos: [],
  samples: [],
  social: [],
  works: [],
};

/**
 * Loads every piece of landing content in one pass, on the server.
 *
 * This used to be a `useEffect` in a client hook, which meant the HTML that
 * reached crawlers contained a loading spinner and nothing else — no name, no
 * works, no contact details. Search engines that do not run JavaScript, and
 * every social/link preview scraper, saw an empty page. Fetching here puts the
 * real content in the first response.
 *
 * A failure degrades to empty collections rather than throwing: the page still
 * renders its static chrome and the fallback profile copy.
 */
export async function fetchLandingContent(): Promise<LandingContentData> {
  try {
    const [profile, demos, samples, social, works] = await Promise.all([
      client.fetch<ProfileData | null>(
        `*[_type == "profile"][0] { name, role, bio, "picture": picture.asset->url }`,
      ),
      client.fetch<DemoItem[]>(
        `*[_type == "demo"] | order(_createdAt desc) { title, category, videoUrl }`,
      ),
      client.fetch<SampleItem[]>(
        `*[_type == "sample"] | order(_createdAt desc) { title, category, "audioUrl": audioFile.asset->url, duration }`,
      ),
      client.fetch<SocialItem[]>(
        `*[_type == "profile"][0].social[] { platform, url, username, description }`,
      ),
      client.fetch<WorkItem[]>(
        `*[_type == "work"] | order(_createdAt desc) { title, category, country, youtubeUrl }`,
      ),
    ]);

    return {
      profile: profile
        ? {
            name: profile.name,
            role: profile.role,
            bio: profile.bio ?? null,
            picture: profile.picture ?? null,
          }
        : null,
      demos: demos ?? [],
      samples: (samples ?? []).map((s) => ({ ...s, audioUrl: s.audioUrl || "" })),
      social: social ?? [],
      works: works ?? [],
    };
  } catch (err) {
    console.error("[Sanity] Fetch error:", err instanceof Error ? err.message : err);
    return EMPTY;
  }
}
