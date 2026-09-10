import type { SocialItem } from "@/lib/content";

interface JsonLdProps {
  name: string;
  role: string;
  bio: string;
  picture: string | null;
  social: SocialItem[];
  siteUrl: string;
}

/**
 * Person + WebSite structured data.
 *
 * `sameAs` is what lets Google connect this page to the same individual across
 * Instagram, LinkedIn and the rest, which is the entry ticket for a knowledge
 * panel on a personal-brand query.
 *
 * The JSON is serialised with `<` escaped: a stray `</script>` inside any CMS
 * field would otherwise close the tag early and turn content into markup.
 */
export default function JsonLd({
  name,
  role,
  bio,
  picture,
  social,
  siteUrl,
}: JsonLdProps) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name,
        jobTitle: role,
        description: bio,
        url: siteUrl,
        ...(picture ? { image: picture } : {}),
        ...(social.length ? { sameAs: social.map((s) => s.url).filter(Boolean) } : {}),
        knowsLanguage: ["es", "en"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: `${name} — ${role}`,
        inLanguage: "es-AR",
        publisher: { "@id": `${siteUrl}/#person` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
