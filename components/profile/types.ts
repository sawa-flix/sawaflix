/**
 * Profile System Types
 * Complete type definitions for user profile, settings, and related data
 */

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatar: string;
  coverImage: string;
  bio: string;
  joinDate: string;
  region?: string;
  language: string;
  country: string;
  preferences?: UserPreferences;
  isPremium?: boolean;
}

export interface UserStats {
  moviesWatched: number;
  musicPlayed: number;
  watchlistItems: number;
  downloads: number;
}

export interface UserPreferences {
  videoQuality: 'auto' | '480p' | '720p' | '1080p' | '4k';
  subtitles: boolean;
  subtitleLanguage: string;
  autoplayNextEpisode: boolean;
  autoplayNextTrack: boolean;
  notificationsEnabled: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: 'Free' | 'Standard' | 'Premium';
  status: 'ACTIVE' | 'CANCELLED' | 'INACTIVE';
  startDate: string;
  renewalDate?: string;
  price: number;
  features: string[];
  autoRenew: boolean;
}

export interface SecuritySettings {
  passwordLastChanged: string;
  twoFactorEnabled: boolean;
  activeSessions: Array<{
    id: string;
    device: string;
    browser: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }>;
  lastLogin: string;
}

export interface RecentlyWatched {
  id: string;
  title: string;
  type: 'movie' | 'music';
  thumbnail: string;
  watchedDate: string;
  progress: number; // 0-100
  duration: string; // "2h 15m" or "3:45"
}

// Component Props
export interface ProfileHeaderProps {
  user: UserProfile;
  onEditClick: () => void;
}

export interface UserStatsGridProps {
  stats: UserStats;
}

export interface ProfileMenuProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export interface ProfileSectionProps {
  user?: UserProfile;
  plan?: SubscriptionPlan;
  preferences?: UserPreferences;
  settings?: SecuritySettings;
  items?: RecentlyWatched[];
  onSave?: (data: any) => void;
  onManageClick?: () => void;
  onItemClick?: (id: string) => void;
  onDeleteClick?: (id: string) => void;
}

export interface EditProfileFormProps {
  user: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
}
