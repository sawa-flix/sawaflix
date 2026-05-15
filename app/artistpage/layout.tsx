import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artist Spotlight | Sawaflix",
  description: "Discover talented African artists and their cultural contributions on Sawaflix. Explore discographies, upcoming events, and more.",
  openGraph: {
    title: "Artist Spotlight | Sawaflix",
    description: "Explore the sounds and stories of Africa's finest artists.",
    images: ["https://i.ibb.co/27LNPd8v/sawaflixmusic-cover.png"],
  },
};

export default function ArtistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
