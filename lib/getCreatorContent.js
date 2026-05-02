import { createClient } from "../utils/supabase/server";
import { BACKEND_URL } from "./apiConfig";

/**
 * Fetches real content from the backend API for the current logged-in creator.
 * Falls back to an empty array if the fetch fails.
 * @param {string} [creatorId] - Optional creator ID to filter by. If not provided, uses the logged-in user's ID.
 */
export async function getCreatorContent(creatorId) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // If no creatorId was passed, use the logged-in user's ID
    const userId = creatorId || session?.user?.id;

    if (!userId) {
      console.warn("[getCreatorContent] No user ID available, returning empty array.");
      return [];
    }

    // Fetch all content from the backend
    const res = await fetch(`${BACKEND_URL}/api/content`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // Disable Next.js caching so we always get fresh data after uploads
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[getCreatorContent] Backend returned status ${res.status}`);
      return [];
    }

    const json = await res.json();
    const allContent = json.data || json || [];

    // Filter to only show this creator's content
    const myContent = allContent.filter(
      (item) => item.creator_id === userId
    );

    // Map backend fields to the format ContentCard/ContentManager expect
    return myContent.map((item) => ({
      id: item.id,
      title: item.title || "Untitled",
      description: item.description || "",
      thumbnail: item.cover_url || null,
      type: item.category || item.content_type || "content",
      views: 0, // Backend doesn't track views yet
      status: item.visibility === "public" ? "approved" : "draft",
      created_at: item.created_at,
      // Keep original fields for reference
      media_url: item.media_url,
      content_type: item.content_type,
      category: item.category,
      tags: item.tags || [],
    }));
  } catch (err) {
    console.error("[getCreatorContent] Error fetching content:", err);
    return [];
  }
}