export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'follow' 
  | 'reel_interaction' 
  | 'music_interaction' 
  | 'mention' 
  | 'new_post'
  | 'blog'
  | 'story'
  | 'system';

export interface Notification {
  id: string;
  userId: string; // Recipient
  actorId?: string; // Who triggered it
  actorName?: string;
  actorImage?: string;
  type: NotificationType;
  title: string;
  message: string;
  contentId?: string; // ID or slug of the related content (post, reel, blog, etc.)
  contentType?: 'video' | 'reel' | 'music' | 'user' | 'blog' | 'story';
  category?: string;
  thumbnail?: string;
  read: boolean;
  createdAt: number; // Timestamp
}

export interface NotificationPayload {
  userId: string;
  actorId?: string;
  actorName?: string;
  actorImage?: string;
  type: NotificationType;
  title: string;
  message: string;
  contentId?: string;
  contentType?: 'video' | 'reel' | 'music' | 'user' | 'blog' | 'story';
  category?: string;
  thumbnail?: string;
}
