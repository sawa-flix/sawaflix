import CreatorWizard from '@/components/creator-wizard/CreatorWizard';

export const metadata = {
    title: 'Creator Verification | SawaFlix',
    description: 'Join SawaFlix as a verified creator and share your cultural story.',
};

export default function CreatorVerifyPage() {
    return (
        <main className="min-h-screen bg-[#0B0E14]">
            <CreatsorWizard />
        </main>
    );
}
