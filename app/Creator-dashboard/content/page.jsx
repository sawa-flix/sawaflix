import { getUserProfile } from "@/lib/getUserProfile";
import { getCreatorContent } from "@/lib/getCreatorContent";
import ContentManager from "@/components/Dashboard/ContentManager";

export default async function CreatorContentPage() {
  const profile = await getUserProfile();
  const content = await getCreatorContent(profile.id);

  return <ContentManager initialContent={content} />;
}