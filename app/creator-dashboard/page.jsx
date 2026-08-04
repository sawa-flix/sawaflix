import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile";
import PostTypeSelector from "@/components/Dashboard/PostTypeSelector";

export default async function CreatorDashboardPage() {
  const profile = await getUserProfile();
  if (!profile) redirect("/dashboard");

  // The Post tab should point to this page, which shows Post/Transfer selection
  // DO NOT add redirects here if you want to see the selection buttons
  return <PostTypeSelector />;
}
