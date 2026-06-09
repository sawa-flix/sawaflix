import DashboardWrapper from "../../components/Dashboard/DashboardWrapper";
import OfflineBanner from "../../components/OfflineBanner";

export const metadata = {
  title: 'Dashboard | SawaFlix',
  description: 'Your entertainment dashboard',
};

export default function DashboardLayout({ children }) {
  return (
    <>
      {/* Network-state supervisor: shows banner when offline, pre-fetches videos when online */}
      <OfflineBanner />
      <DashboardWrapper>
        {children}
      </DashboardWrapper>
    </>
  );
}
