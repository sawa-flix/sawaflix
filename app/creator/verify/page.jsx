import Link from 'next/link';
import VerificationChoiceContainer from '@/components/creator-wizard/VerificationChoiceContainer';
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile"; 
import DashboardWrapper from '@/components/Dashboard/DashboardWrapper';

export const dynamic = "force-dynamic";

export const metadata = {
    title: 'Creator Verification | SawaFlix',
    description: 'Join SawaFlix as a verified creator or organization and share your cultural story.',
};

export default async function CreatorVerifyPage() {
    const profile = await getUserProfile();
    
    const status = profile?.verificationStatus || 'none';

    if (!profile) {
        redirect("/dashboard");
    }

    if (status === "pending") {
        redirect("/creator/pending");
    }

    if (status === "approved") {
        redirect("/creator-dashboard");
    }

    return (
        <DashboardWrapper>
            <VerificationChoiceContainer />
        </DashboardWrapper>
    );
}
