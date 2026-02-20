// @ts-check

/**
 * The list of valid creator role types.
 * Must stay in sync with Ngam's backend enum.
 * @typedef {'musician'|'filmmaker'|'influencer'|'visual_artist'|'other'} CreatorType
 */

/**
 * Verification lifecycle states — driven by backend state machine only.
 * Frontend NEVER mutates these directly.
 * Flow: unverified → pending → approved
 *                           ↘ rejected
 * @typedef {'unverified'|'pending'|'approved'|'rejected'} VerificationStatus
 */

/**
 * The full shape of a creator profile returned from the DB / API.
 * @typedef {{
 *   id: string,
 *   email: string,
 *   creatorType: CreatorType|null,
 *   verificationStatus: VerificationStatus,
 *   rejectionReason?: string|null,
 *   submittedAt?: string|null,
 * }} CreatorProfile
 */

/**
 * All available creator role options (for UI rendering).
 * @type {{ value: CreatorType, label: string, icon: string, description: string }[]}
 */
export const CREATOR_ROLES = [
  {
    value: 'musician',
    label: 'Musician',
    icon: '🎵',
    description: 'Share your music, beats, and sound',
  },
  {
    value: 'filmmaker',
    label: 'Filmmaker',
    icon: '🎬',
    description: 'Films, short videos, documentaries',
  },
  {
    value: 'influencer',
    label: 'Influencer',
    icon: '📱',
    description: 'Content creation and lifestyle',
  },
  {
    value: 'visual_artist',
    label: 'Visual Artist',
    icon: '🎨',
    description: 'Photography, design, digital art',
  },
  {
    value: 'other',
    label: 'Other',
    icon: '✨',
    description: 'Something uniquely yours',
  },
];

/**
 * Valid creator type values (for validation guards).
 * @type {CreatorType[]}
 */
export const VALID_CREATOR_TYPES = CREATOR_ROLES.map(r => r.value);

/**
 * Valid verification statuses (for guards).
 * @type {VerificationStatus[]}
 */
export const VALID_VERIFICATION_STATUSES = ['unverified', 'pending', 'approved', 'rejected'];
