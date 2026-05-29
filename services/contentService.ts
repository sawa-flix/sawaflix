import { BACKEND_URL } from "@/lib/apiConfig";
import { createClient } from "@/utils/supabase/client";

/**
 * Content Service to handle API calls to the Sawaflix Backend
 */
export const contentService = {
  /**
   * Upload new content (POST)
   * Used for Music, Food, and Stories
   * @param category - 'music', 'food', or 'stories'
   * @param formData - FormData object containing files and text fields
   */
  async uploadContent(category: 'music' | 'food' | 'stories', formData: FormData) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch(`${BACKEND_URL}/api/content/${category}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData, // FormData handles 'Content-Type': 'multipart/form-data' automatically
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to upload ${category}`);
    }

    return await response.json();
  },

  /**
   * Update existing content (PUT)
   * @param id - The ID of the content to update
   * @param category - The category of the content
   * @param details - Object containing the fields to update
   */
  async updateContent(id: string, category: string, details: any) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch(`${BACKEND_URL}/api/content/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        ...details,
        category // Backend often needs the category to know which table to update
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update content');
    }

    return await response.json();
  }
};
