export interface Musician {
  id: string;
  name: string;
  image: string;
  born?: number;
  died?: number;
  year?: number; // for active year or birth if born not used
  formed?: number; // for groups/bands
  country: string;
  genres: string[];
  featured: boolean;
  description: string;
  topSongs?: string[];
  albums?: string[];
  awards?: string[];
  rating?: number;
}