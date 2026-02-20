import { redirect } from 'next/navigation';
import { getCreatorProfile } from '../../../lib/getCreatorProfile';
import DashboardWrapper from '../../../components/Dashboard/DashboardWrapper';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import UnverifiedDashboard from '../../../components/dashboard/UnverifiedDashboard';
import PendingDashboard from '../../../components/dashboard/PendingDashboard';
import ApprovedDashboard from '../../../components/dashboard/ApprovedDashboard';
import RejectedDashboard from '../../../components/dashboard/RejectedDashboard';

export const metadata = {
  title: 'Dashboard | SawaFlix',
  description: 'Your creator dashboard on SawaFlix.',
};

/**
 * The creator dashboard root.
 * This is a Server Component — routing logic lives here, driven entirely by backend state.
 *
 * Routing rules:
 *   1. No user           → /login
 *   2. No creatorType    → /select-role  (must choose role first)
 *   3. verificationStatus switch → render the matching dashboard state
 */
export default async function DashboardPage() {
  const profile = await getCreatorProfile();

  // Guard 1: must be authenticated
  if (!profile) {
    redirect('/login');
  }

  // Guard 2: must have selected a creator role
  if (!profile.creatorType) {
    redirect('/select-role');
  }

  // Render the correct state component
  const renderDashboardState = () => {
    switch (profile.verificationStatus) {
      case 'pending':
        return (
          <PendingDashboard
            creatorType={profile.creatorType}
            submittedAt={profile.submittedAt}
          />
        );
      case 'approved':
        return (
          <ApprovedDashboard
            creatorType={profile.creatorType}
          />
        );
      case 'rejected':
        return (
          <RejectedDashboard
            creatorType={profile.creatorType}
            rejectionReason={profile.rejectionReason}
          />
        );
      case 'unverified':
      default:
        return (
          <UnverifiedDashboard
            creatorType={profile.creatorType}
          />
        );
    }
  };

  return (
    <DashboardWrapper>
      <DashboardShell
        creatorType={profile.creatorType}
        verificationStatus={profile.verificationStatus}
      >
        {renderDashboardState()}
      </DashboardShell>
    </DashboardWrapper>
  );
}
