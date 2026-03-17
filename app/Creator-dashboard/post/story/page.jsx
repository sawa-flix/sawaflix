import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile";
import UnifiedUploadForm from "@/components/Dashboard/UnifiedUploadForm";

export default async function PostStoryPage() {
    const profile = await getUserProfile();
    
    // Kick them out if they aren't approved for stories
    if (profile.category?.toLowerCase() !== 'story') {
        redirect('/Creator-dashboard'); 
    }

    return (
        <div className="p-6">
             <UnifiedUploadForm category="story" />
        </div>
    );
}
