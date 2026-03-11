import ApprovedDashboard from "@/components/Dashboard/ApprovedDashboard";
import { createClient } from "@/utils/supabase/server";

export default async function CreatorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userProfile = null;
  let creatorName = "Creator";

  if (user) {
    const { data } = await supabase
      .from('users')
      .select('username, profile_image_url, cover_image_url, bio')
      .eq('id', user.id)
      .single();
    
    if (data) {
      userProfile = {
        username: data.username,
        profileImage: data.profile_image_url,
        bannerImage: data.cover_image_url,
        bio: data.bio
      };
      creatorName = data.username;
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <ApprovedDashboard creatorName={creatorName} userProfile={userProfile} />
    </div>
  );
}