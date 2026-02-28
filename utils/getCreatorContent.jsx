import { createClient } from "@/utils/supabase/client";

export async function getCreatorContent(userId) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching creator content:", error);
    return [];
  }

  return data;
}