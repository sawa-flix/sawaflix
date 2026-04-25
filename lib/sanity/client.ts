/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "eifjj9rh";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const API_VERSION = "2024-01-01";

export const sanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: true,
});

// Image URL builder
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// Direct fetch helper (bypasses @sanity/client if it has issues)
export async function sanityFetch(query: string, params: Record<string, any> = {}) {
  try {
    // Try the client first
    const result = await sanityClient.fetch(query, params);
    return result;
  } catch (clientError) {
    console.warn("Sanity client fetch failed, trying direct API:", clientError);

    // Fallback: fetch directly from Sanity HTTP API
    try {
      const encodedQuery = encodeURIComponent(query);
      const paramString = Object.entries(params)
        .map(([key, val]) => `$${key}=${JSON.stringify(val)}`)
        .join("&");
      
      const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodedQuery}${paramString ? "&" + paramString : ""}`;
      
      const res = await fetch(url);
      const json = await res.json();
      return json.result;
    } catch (fetchError) {
      console.error("Direct Sanity API fetch also failed:", fetchError);
      return null;
    }
  }
}
