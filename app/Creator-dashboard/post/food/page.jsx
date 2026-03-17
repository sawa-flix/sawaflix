import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile";
import UnifiedUploadForm from "@/components/Dashboard/UnifiedUploadForm";

export default async function PostFoodPage() {
    const profile = await getUserProfile();
    
    // Kick them out if they aren't approved for food
    if (profile.category?.toLowerCase() !== 'food') {
        redirect('/Creator-dashboard'); 
    }

    return (
        <div className="p-6">
            <UnifiedUploadForm category="food" />
        </div>
    );
}
