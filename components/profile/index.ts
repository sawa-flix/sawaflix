/**
 * Profile Components - Public API
 * Centralized exports for all profile-related components
 */

export { default as ProfileHeader } from './ProfileHeader';
export { default as UserStatsGrid } from './UserStatsGrid';
export { default as ProfileMenu } from './ProfileMenu';
export { default as EditProfileForm } from './EditProfileForm';

export {
  PersonalInformationSection,
  SubscriptionPlanSection,
  PreferencesSection,
  SecuritySection,
  RecentlyWatchedSection,
} from './sections';

export type {
  UserProfile,
  UserStats,
  UserPreferences,
  SubscriptionPlan,
  SecuritySettings,
  RecentlyWatched,
  ProfileHeaderProps,
  UserStatsGridProps,
  ProfileMenuProps,
} from './types';

export {
  DEFAULT_USER_PROFILE,
  DEFAULT_USER_STATS,
  DEFAULT_PREFERENCES,
  DEFAULT_SUBSCRIPTION,
  DEFAULT_SECURITY_SETTINGS,
  DEFAULT_RECENTLY_WATCHED,
  PROFILE_MENU_SECTIONS,
  PROFILE_COLORS,
} from './constants';
