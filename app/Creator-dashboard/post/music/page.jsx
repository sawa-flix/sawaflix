import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile";
import UnifiedUploadForm from "@/components/Dashboard/UnifiedUploadForm";

export default async function PostMusicPage() {
    const profile = await getUserProfile();
    
    // Kick them out if they aren't approved for music
    if (profile.category?.toLowerCase() !== 'music') {
        redirect('/Creator-dashboard'); 
    }

    return (
        <div className="p-6">
            <UnifiedUploadForm category="music" />
        </div>
    );
}
