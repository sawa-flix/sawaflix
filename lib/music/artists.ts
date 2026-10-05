import sawaflixData from '@/Data.json';
import artistSeedData from '../../public/artist.json';

const curatedProfiles = [
  {
    id: 'jovi',
    name: 'Jovi',
    image: 'https://i.ibb.co/TD26rNtX/jovi-2.png',
    genres: ['Hip Hop', 'Rap', 'Mboko', 'Afro Trap'],
    bio: 'Award-winning rapper, producer, and founder of New Bell Music. Known for pioneering the Mboko movement in Cameroonian music.',
  },
  {
    id: 'salatiel',
    name: 'Salatiel',
    image: 'https://i.ibb.co/dwBpWvBH/salatiel.png',
    genres: ['Afrobeats', 'Pop', 'R&B', 'World Music'],
    bio: "Singer, songwriter, producer, and CEO of Alpha Better Records, internationally known for his work on Beyoncé's 'Brown Skin Girl'.",
  },
  {
    id: 'mr-leo',
    name: 'Mr Leo',
    image: 'https://i.ibb.co/rK1zP0yY/leo.png',
    genres: ['Afropop', 'Afrobeats', 'R&B'],
    bio: "One of Cameroon’s most streamed artists, known for romantic melodies and songs like 'Kemayo' and 'Jamais Jamais'.",
  },
  {
    id: 'askia',
    name: 'Askia',
    image: 'https://i.ibb.co/R4N80w8q/askia.png',
    genres: ['Hip Hop', 'Conscious Rap', 'Alternative Rap'],
    bio: 'Respected lyricist and storyteller known for socially conscious music and sharp wordplay.',
  },
  {
    id: 'stanley-enow',
    name: 'Stanley Enow',
    image: 'https://i.ibb.co/MyGKGzQC/tenow.png',
    genres: ['Hip Hop', 'Afropop', 'Rap'],
    bio: "MTV Africa Music Award winner and one of Cameroon’s most internationally recognized rappers, famous for 'Hein Père'.",
  },
  {
    id: 'pascal',
    name: 'Pascal',
    image: 'https://i.ibb.co/ZRsqkkBd/pascal.png',
    genres: ['Afrobeats', 'Pop', 'Alternative'],
    bio: 'Singer and songwriter from New Bell Music known for smooth vocals and modern Afro-fusion.',
  },
  {
    id: 'mic-monsta',
    name: 'Mic Monsta',
    image: 'https://i.ibb.co/jvRHyzLp/mmonsta.png',
    genres: ['Hip Hop', 'Rap', 'Trap'],
    bio: "Cameroonian rapper recognized for powerful lyricism, freestyle skills, and projects like 'Heart'.",
  },
  {
    id: 'lady-ponce',
    name: 'Lady Ponce',
    image: 'https://i.ibb.co/KctwKR6f/lponce.png',
    genres: ['Makossa', 'Afropop', 'Traditional'],
    bio: 'One of Cameroon’s celebrated female artists, blending Makossa rhythms with modern African sounds.',
  },
];

const curatedProfileLookup = new Map(
  curatedProfiles.map((profile) => [profile.name.trim().toLowerCase(), profile]),
);
const artistDetailLookup = new Map(
  (sawaflixData.music_artists ?? []).map((artist) => [artist.name.trim().toLowerCase(), artist]),
);
const artistSeed = Array.isArray(artistSeedData?.artists) ? artistSeedData.artists : [];

function toArtistId(name: string): string {
  return name
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'artist';
}

export const artistsData = artistSeed.map((seedArtist) => {
  const normalizedName = seedArtist.name.trim().toLowerCase();
  const profile = curatedProfileLookup.get(normalizedName);
  const details = artistDetailLookup.get(normalizedName);

  return {
    id: profile?.id ?? toArtistId(seedArtist.name),
    name: seedArtist.name,
    image: profile?.image ?? '/logos_and_pwas/loaderLogo.png',
    country: details?.region ?? 'Cameroon',
    region: details?.region ?? 'Cameroon',
    genres: details?.genre ?? profile?.genres ?? [],
    bio: details?.biography ?? profile?.bio ?? `${seedArtist.name} is a Cameroonian recording artist.`,
    yearsActive: details?.years_active ?? null,
    songs: details?.songs ?? [],
    spotifyFollowers: seedArtist.spotify_followers,
    spotifyMonthlyListeners: seedArtist.spotify_monthly_listeners,
    rankByFollowers: seedArtist.rank_by_followers,
    rankByMonthlyListeners: seedArtist.rank_by_monthly_listeners,
  };
});
