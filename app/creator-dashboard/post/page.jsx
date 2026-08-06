import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile";
import PostTypeSelector from "@/components/Dashboard/PostTypeSelector";

export default async function PostSelectorPage() {
  const profile = await getUserProfile();
  if (!profile) redirect("/dashboard");

  return <PostTypeSelector />;
}
