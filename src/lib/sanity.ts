import { createClient } from "@sanity/client";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: true,
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export async function getSanityData<T = unknown>(query: string, params?: Record<string, unknown>) {
  return params ? client.fetch<T>(query, params) : client.fetch<T>(query);
}

export async function getSchemaData<T = unknown>(schemaName: string, fields: string[] = ["_id"]) {
  return client.fetch<T>(`*[_type == "${schemaName}"] | order(_createdAt desc) [0...10] { ${fields.join(", ")} }`);
}
