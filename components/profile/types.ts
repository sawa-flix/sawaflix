export interface UserProfile {
  id?: string;
  username?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  region?: string;
  country?: string;
  language?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  joinDate?: string;
  isPremium?: boolean;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
}
