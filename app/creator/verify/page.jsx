import CreatorWizard from '@/components/creator-wizard/CreatorWizard';
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile"; // adjust path if needed

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

    // 🚫 Not a creator
    if (profile.category !== "creator") {
        redirect("/dashboard");
    }

    // 🚫 Already submitted or approved
    if (profile.verificationStatus === "pending") {
        redirect("/creator/pending");
    }
    if (profile.verificationStatus === "approved") {
        redirect("/Creator-dashboard");
    }
    if (profile.verificationStatus === "rejected") {
        redirect("/dashboard");
    }

    return (
        <main className="min-h-screen bg-[#0B0E14]">
            <CreatorWizard />
        </main>
    );
}