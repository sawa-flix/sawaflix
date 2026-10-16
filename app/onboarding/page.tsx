import { AuthModalProvider } from '@/contexts/AuthModalContext';
import CameroonMapOnboarding from '@/components/onboarding/CameroonMapOnboarding';

export default function OnboardingPage() {
  return (
    <AuthModalProvider>
      <CameroonMapOnboarding />
    </AuthModalProvider>
  );
}