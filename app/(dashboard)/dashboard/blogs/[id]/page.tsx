import { Metadata } from "next";
import { sanityFetch, urlFor } from "@/lib/sanity/client";
import BlogDetailsClient from "./BlogDetailsClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  const STORY_QUERY = `*[_type == "story" && (slug.current == $id || _id == $id)][0] {
    title, excerpt, mainImage, author->{ name }
  }`;
  
  const story = await sanityFetch(STORY_QUERY, { id });

  if (!story) {
    return {
      title: "Story Not Found | Sawaflix",
    };
  }

  const imageUrl = story.mainImage 
    ? urlFor(story.mainImage).width(1200).height(630).url() 
    : "https://i.ibb.co/27LNPd8v/sawaflixmusic-cover.png";

  return {
    title: story.title,
    description: story.excerpt || `Read ${story.title} on Sawaflix.`,
    openGraph: {
      title: story.title,
      description: story.excerpt,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: story.title,
        },
      ],
      type: "article",
      authors: [story.author?.name || "Sawaflix Heritage Team"],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.excerpt,
      images: [imageUrl],
    },
    keywords: [story.title, "Sawaflix blog", "African stories", "African culture", "Sawa heritage", "Fonyuy Gita", "Mazehwo John Brindi", "Ngam Sabastine", "Wohking", "Asime Domitila", "Victory Beleh", "Kingsley"],
    authors: [{ name: story.author?.name || "Sawaflix", url: "https://sawaflix.com" }],
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <BlogDetailsClient slug={id} />;
}
