import CreatorWizard from '@/components/creator-wizard/CreatorWizard';
import { getCreatorProfile } from '@/lib/getCreatorProfile';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Start Verification | SawaFlix',
  description: 'Begin the creator verification process on SawaFlix.',
};

/**
 * The canonical entry point for Beleh's verification wizard.
 * Asime owns this route — it guards auth + passes creatorType to the wizard.
 * After Beleh's wizard POSTs /verification, backend sets status → 'pending',
 * and the dashboard router will auto-show PendingDashboard on next load.
 */
export default async function VerificationStartPage() {
  const profile = await getCreatorProfile();

  // Must be authenticated to start verification
  if (!profile) {
    redirect('/login');
  }

  // Must have a role before verifying
  if (!profile.creatorType) {
    redirect('/select-role');
  }

  return (
    <main className="min-h-screen bg-[#0B0E14]">
      <CreatorWizard creatorType={profile.creatorType} />
    </main>
  );
}
