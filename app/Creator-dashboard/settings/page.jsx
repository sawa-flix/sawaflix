import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile";

export default async function SettingsPage() {
  const profile = await getUserProfile();

  if (!profile) redirect("/login");

  // Redirect to their profile page which now handles editing
  redirect(`/creator/${profile.username}`);
}
