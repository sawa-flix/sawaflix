import { BACKEND_URL } from '@/lib/apiConfig';
import { createClient } from '@/utils/supabase/client';

export interface Interactor {
  id: string;
  name: string;
  avatar: string;
}

export interface VideoStatsResponse {
  videoId: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  downloadsCount: number;
  viewsCount: number;
  isLikedByUser: boolean;
  interactors?: Interactor[];
}

export interface VideoCommentReply {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  userRole?: string;
  content: string;
  parentId: string | null;
  isPinned: boolean;
  createdAt: string;
  likesCount: number;
  isLikedByMe: boolean;
}

export interface VideoCommentItem {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  userRole?: string;
  content: string;
  parentId: null;
  isPinned: boolean;
  createdAt: string;
  likesCount: number;
  isLikedByMe: boolean;
  replies: VideoCommentReply[];
  repliesCount: number;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // Guest
  }
  return {};
}

export const videoInteractivityService = {
  /**
   * 1. Get consolidated video stats (Likes, comments, shares, downloads, interactors)
   */
  async getStats(videoId: string): Promise<VideoStatsResponse | null> {
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/stats`, {
        headers: {
          ...authHeader,
        },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[videoInteractivityService] getStats warning:', err);
      return null;
    }
  },

  /**
   * 2. Toggle Like on a video
   */
  async toggleLike(videoId: string): Promise<{ liked: boolean; likesCount: number }> {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to toggle like (${res.status})`);
    }
    return await res.json();
  },

  /**
   * 3. Get comments for a video
   */
  async getComments(videoId: string, sort: 'top' | 'newest' = 'top'): Promise<{ comments: VideoCommentItem[]; totalCount: number }> {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/comments?sort=${sort}`, {
      headers: {
        ...authHeader,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch comments (${res.status})`);
    }
    return await res.json();
  },

  /**
   * 4. Post comment or nested reply
   */
  async postComment(videoId: string, content: string, parentId?: string): Promise<{ comment: VideoCommentItem; commentsCount: number }> {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
      body: JSON.stringify({ content, parentId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to post comment (${res.status})`);
    }
    return await res.json();
  },

  /**
   * 5. Toggle comment upvote
   */
  async toggleCommentLike(commentId: string): Promise<{ liked: boolean; likesCount: number }> {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/interactions/video/comments/${encodeURIComponent(commentId)}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to toggle comment upvote (${res.status})`);
    }
    return await res.json();
  },

  /**
   * 6. Delete comment
   */
  async deleteComment(commentId: string): Promise<{ success: boolean; commentsCount: number }> {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/interactions/video/comments/${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
      headers: {
        ...authHeader,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to delete comment (${res.status})`);
    }
    return await res.json();
  },

  /**
   * 7. Log video share
   */
  async logShare(videoId: string, platform = 'web_share'): Promise<{ success: boolean; sharesCount: number }> {
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ platform }),
      });
      if (!res.ok) return { success: false, sharesCount: 0 };
      return await res.json();
    } catch {
      return { success: false, sharesCount: 0 };
    }
  },

  /**
   * 8. Log video download & get stream URL
   */
  async logDownload(videoId: string, mode = 'direct_file'): Promise<{ success: boolean; downloadsCount: number }> {
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) return { success: false, downloadsCount: 0 };
      return await res.json();
    } catch {
      return { success: false, downloadsCount: 0 };
    }
  },

  /**
   * 9. Download stream URL
   */
  getDownloadUrl(videoId: string): string {
    return `${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/download-stream`;
  },
};
