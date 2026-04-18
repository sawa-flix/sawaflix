import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile";
import DashboardWrapper from "@/components/Dashboard/DashboardWrapper";

export default async function CreatorLayout({ children }) {
  const profile = await getUserProfile();

  if (!profile) redirect("/login");
  if (profile.verification_status?.toLowerCase() !== "approved" && profile.role?.toLowerCase() !== "admin") redirect("/dashboard");

  return (
    <DashboardWrapper>
      <div className="min-h-screen">
        {children}
      </div>
    </DashboardWrapper>
  );
}

