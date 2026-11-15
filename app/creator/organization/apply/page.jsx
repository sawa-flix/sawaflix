import React from 'react';
import OrganizationWizard from '@/components/creator-wizard/OrganizationWizard';
import DashboardWrapper from '@/components/Dashboard/DashboardWrapper';

export const metadata = {
  title: 'Organization Creator Application | SawaFlix',
  description: 'Apply as a verified organization to publish and manage content on SawaFlix.',
};

export default function OrganizationApplyPage() {
  return (
    <DashboardWrapper>
      <OrganizationWizard />
    </DashboardWrapper>
  );
}
