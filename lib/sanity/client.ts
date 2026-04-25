/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "eifjj9rh";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const API_VERSION = "2024-01-01";

// Disable CDN in development to see changes immediately
const useCdn = process.env.NODE_ENV === "production";

export const sanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: useCdn,
});

// Image URL builder
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// Direct fetch helper (bypasses @sanity/client if it has issues)
export async function sanityFetch(query: string, params: Record<string, any> = {}) {
  console.log(`[Sanity] Fetching query: ${query.substring(0, 50)}...`, params);
  
  try {
    const result = await sanityClient.fetch(query, params);
    console.log(`[Sanity] Successfully fetched from client.`);
    return result;
  } catch (clientError) {
    console.warn("[Sanity] Client fetch failed, trying direct API fallback:", clientError);

    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodedQuery}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      
      const json = await res.json();
      console.log(`[Sanity] Successfully fetched from direct API.`);
      return json.result;
    } catch (fetchError) {
      console.error("[Sanity] Direct API fetch also failed:", fetchError);
      return null;
    }
  }
}
