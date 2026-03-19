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

    if (profile.verificationStatus === "pending" || profile.verificationStatus === "approved") {
        return (
            <DashboardWrapper>
                <div className="min-h-[70vh] flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-[#141820]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-red-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/30">
                            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Application Received</h2>
                        <p className="text-zinc-400 font-medium leading-relaxed mb-10">
                            You have already submitted an application to be a creator on SawaFlix. Your request is currently {profile.verificationStatus === "pending" ? "under review" : "approved"}.
                        </p>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={() => window.location.href = profile.verificationStatus === 'pending' ? '/creator/pending' : '/creator-dashboard'}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-red-600/20 active:scale-95"
                            >
                                View My Status
                            </button>
                            
                            <div className="pt-2">
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3">Want to change your state?</p>
                                <a 
                                    href="/contact" 
                                    className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 font-black text-xs uppercase tracking-widest transition-colors group"
                                >
                                    Contact SawaFlix Team
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardWrapper>
        );
    }

    // Allow re-applying if rejected
    // (removed the previous auto-redirect for rejected status to allow them to try again if needed)


    return (
        <DashboardWrapper>
            <CreatorWizard />
        </DashboardWrapper>
    );
}