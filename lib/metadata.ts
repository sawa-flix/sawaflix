import type { Metadata } from 'next';

const OG_IMAGE = 'https://i.ibb.co/4HC007J/image.png';
const SITE_URL = 'https://sawaflixplay.vercel.app';
const SITE_NAME = 'Sawaflix';

export const defaultMetadata: Metadata = {
  title: 'Sawaflix - African Music & Culture',
  description: 'Discover authentic African music, traditions, and cultural content on Sawaflix. Stream the best of African entertainment.',
  keywords: ['African music', 'African culture', 'streaming', 'entertainment', 'traditions'],
  openGraph: {
    title: 'Sawaflix - African Music & Culture',
    description: 'Discover authentic African music, traditions, and cultural content on Sawaflix.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Sawaflix - African Music & Culture',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sawaflix - African Music & Culture',
    description: 'Discover authentic African music, traditions, and cultural content on Sawaflix.',
    images: [OG_IMAGE],
  },
};

// Override metadata for specific pages
export const createPageMetadata = (
  title: string,
  description: string,
  path: string,
  ogImage?: string
): Metadata => {
  const imageUrl = ogImage || OG_IMAGE;
  
  return {
    title: `${title} | Sawaflix`,
    description,
    openGraph: {
      title: `${title} | Sawaflix`,
      description,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Sawaflix`,
      description,
      images: [imageUrl],
    },
  };
};
