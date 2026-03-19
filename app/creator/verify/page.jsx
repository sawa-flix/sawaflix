import CreatorWizard from '@/components/creator-wizard/CreatorWizard';
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile"; 
import DashboardWrapper from '@/components/Dashboard/DashboardWrapper';

export const metadata = {
    title: 'Creator Verification | SawaFlix',
    description: 'Join SawaFlix as a verified creator and share your cultural story.',
};

export default async function CreatorVerifyPage() {
    const profile = await getUserProfile();

    if (!profile) {
        redirect("/login");
    }

    if (profile.verificationStatus === "pending") {
        redirect("/creator/pending");
    }

    if (profile.verificationStatus === "approved") {
        redirect("/creator-dashboard");
    }

    if (profile.role === "creator" && profile.verificationStatus === "rejected") {
        redirect("/dashboard");
    }

    return (
        <DashboardWrapper>
            <CreatorWizard />
        </DashboardWrapper>
    );
}