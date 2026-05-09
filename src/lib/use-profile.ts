import { useEffect, useState } from "react";
import { client } from "@/lib/sanity";

interface ProfileData {
  name: string;
  role: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
}

export function useProfile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        // Fetch ALL fields to see what's available
        const result = await client.fetch<Record<string, unknown>>(
          `*[_type == "profile"][0]`
        );
        console.log("[Sanity] Full profile document:", JSON.stringify(result, null, 2));

        if (!cancelled) {
          if (result) {
            // Map whatever fields exist to our interface
            const profile: ProfileData = {
              name: (result.name as string) || "",
              role: (result.role as string) || "",
              email: (result.email as string) || undefined,
              phoneNumber: (result.phoneNumber as string) || undefined,
              bio: (result.bio as string) || (result.biography as string) || undefined,
            };
            setData(profile);
          } else {
            setError("No profile document found in Sanity");
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[Sanity] Profile fetch error:", msg);
        if (!cancelled) {
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
