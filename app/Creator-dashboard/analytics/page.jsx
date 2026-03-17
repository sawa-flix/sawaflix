import AnalyticsClient from "./AnalyticsClient";
import { headers } from "next/headers";

export default async function AnalyticsPage() {
  // Using absolute URL for Server Component fetch to avoid Next.js failed parsing
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/creator/content`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch content data on the server");
      return <AnalyticsClient content={[]} />;
    }

    const content = await res.json();
    return <AnalyticsClient content={content} />;
  } catch (error) {
    console.error("Fetch error on analytics page:", error);
    return <AnalyticsClient content={[]} />;
  }
}

