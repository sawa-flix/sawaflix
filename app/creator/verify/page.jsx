import CreatorWizard from '@/components/creator-wizard/CreatorWizard';
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile"; 

export const metadata = {
    title: 'Creator Verification | SawaFlix',
    description: 'Join SawaFlix as a verified creator and share your cultural story.',
};

export default async function CreatorVerifyPage() {
    const profile = await getUserProfile();

    // 🚫 Not logged in
    if (!profile) {
        redirect("/login");
    }

    // 🚫 Already a pending creator
    if (profile.role === "creator" && profile.verificationStatus === "pending") {
        redirect("/creator/pending");
    }

    // 🚫 Already an approved creator
    if (profile.role === "creator" && profile.verificationStatus === "approved") {
        redirect("/Creator-dashboard");
    }

    // 🚫 Rejected creator
    if (profile.role === "creator" && profile.verificationStatus === "rejected") {
        redirect("/dashboard");
    }

    return (
        <main className="min-h-screen bg-[#0B0E14]">
            <CreatorWizard />
        </main>
    );
}