import axios from "axios";
import { BACKEND_URL } from "@/lib/apiConfig";
import { createClient } from "@/utils/supabase/client";

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
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // Guest user fallback
  }
  return {};
}

export const videoInteractivityService = {
  async getStats(videoId: string): Promise<VideoStatsResponse | null> {
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(
        `${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/stats`,
        { headers: { ...authHeader } }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn("[videoInteractivityService] getStats warning:", err);
      return null;
    }
  },

  async toggleLike(
    videoId: string
  ): Promise<{ liked: boolean; likesCount: number }> {
    const authHeader = await getAuthHeader();
    const res = await fetch(
      `${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/like`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to toggle like (${res.status})`);
    }
    return await res.json();
  },

  async getComments(
    videoId: string,
    sort: "top" | "newest" = "top"
  ): Promise<{ comments: VideoCommentItem[]; totalCount: number }> {
    const authHeader = await getAuthHeader();
    const res = await fetch(
      `${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/comments?sort=${sort}`,
      { headers: { ...authHeader } }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch comments (${res.status})`);
    }
    return await res.json();
  },

  async postComment(
    videoId: string,
    content: string,
    parentId?: string
  ): Promise<{ comment: VideoCommentItem; commentsCount: number }> {
    const authHeader = await getAuthHeader();
    const res = await fetch(
      `${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ content, parentId }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to post comment (${res.status})`);
    }
    return await res.json();
  },

  async toggleCommentLike(
    commentId: string
  ): Promise<{ liked: boolean; likesCount: number }> {
    const authHeader = await getAuthHeader();
    const res = await fetch(
      `${BACKEND_URL}/api/interactions/video/comments/${encodeURIComponent(commentId)}/like`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.error || `Failed to toggle comment upvote (${res.status})`
      );
    }
    return await res.json();
  },

  async deleteComment(
    commentId: string
  ): Promise<{ success: boolean; commentsCount: number }> {
    const authHeader = await getAuthHeader();
    const res = await fetch(
      `${BACKEND_URL}/api/interactions/video/comments/${encodeURIComponent(commentId)}`,
      { method: "DELETE", headers: { ...authHeader } }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to delete comment (${res.status})`);
    }
    return await res.json();
  },

  async logShare(
    videoId: string,
    platform = "web_share"
  ): Promise<{ success: boolean; sharesCount: number }> {
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(
        `${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/share`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({ platform }),
        }
      );
      if (!res.ok) return { success: false, sharesCount: 0 };
      return await res.json();
    } catch {
      return { success: false, sharesCount: 0 };
    }
  },

  async logDownload(
    videoId: string,
    mode = "in_app_blob"
  ): Promise<{ success: boolean; downloadsCount: number }> {
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(
        `${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/download`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({ mode }),
        }
      );
      if (!res.ok) return { success: false, downloadsCount: 0 };
      return await res.json();
    } catch {
      return { success: false, downloadsCount: 0 };
    }
  },

  getDownloadUrl(videoId: string): string {
    return `${BACKEND_URL}/api/interactions/video/${encodeURIComponent(videoId)}/download-stream`;
  },

  /**
   * In-app video download with progress tracking.
   *
   * Uses `arraybuffer` instead of `blob` for reliable handling of both
   * chunked and Content-Length responses. Validates response shape before
   * writing to disk.
   */
  async downloadVideoTrack(
    videoId: string,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const authHeader = await getAuthHeader();
    const url = this.getDownloadUrl(videoId);

    const response = await axios.get(url, {
      headers: { ...authHeader },
      responseType: "arraybuffer",
      signal,
      onDownloadProgress: (progressEvent) => {
        if (!onProgress) return;

        const loaded = progressEvent.loaded ?? 0;
        const total = progressEvent.total;

        if (total && total > 0) {
          // Preferred: server sent Content-Length → exact percentage
          onProgress(Math.min(100, Math.round((loaded / total) * 100)));
        } else {
          // Fallback: no total known (chunked). Creep toward 95% so the
          // user sees movement but never a misleading "100%".
          const assumedTotal = Math.max(loaded, 20 * 1024 * 1024);
          onProgress(Math.min(95, Math.round((loaded / assumedTotal) * 100)));
        }
      },
    });

    // ---- Validate response ----
    const contentType =
      (response.headers["content-type"] as string | undefined)?.toLowerCase() ??
      "";

    const looksLikeVideo =
      contentType.startsWith("video/") ||
      contentType.startsWith("application/octet-stream");

    if (!looksLikeVideo) {
      let detail = `Backend returned "${contentType || "unknown"}" instead of video`;
      try {
        const text = new TextDecoder().decode(response.data);
        try {
          const parsed = JSON.parse(text);
          if (parsed?.error) detail = parsed.error;
          else if (parsed?.message) detail = parsed.message;
          else detail = text.slice(0, 200);
        } catch {
          detail = text.slice(0, 200) || detail;
        }
      } catch {}
      throw new Error(detail);
    }

    if (!response.data || response.data.byteLength < 4096) {
      throw new Error(
        `Response was only ${response.data?.byteLength ?? 0} bytes — too small to be a video.`
      );
    }

    // ---- Extract filename ----
    const cd = response.headers["content-disposition"] as string | undefined;
    let filename = `SawaFlix_${videoId}.mp4`;

    if (cd) {
      const match = cd.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/i);
      if (match?.[1]) {
        filename = decodeURIComponent(match[1].trim());
      }
    }

    if (!filename.toLowerCase().endsWith(".mp4")) {
      filename = `${filename}.mp4`;
    }

    // ---- Build Blob from ArrayBuffer and trigger download ----
    const blob = new Blob([response.data], { type: "video/mp4" });

    if (blob.size < 4096) {
      throw new Error(`Blob construction failed — only ${blob.size} bytes.`);
    }

    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    }, 2000);

    this.logDownload(videoId, "axios_arraybuffer").catch(() => {});
  },

  /**
   * Legacy fallback downloader.
   */
  async downloadInAppVideo(
    videoId: string,
    filename: string,
    fallbackUrl?: string
  ): Promise<void> {
    this.logDownload(videoId, "in_app_blob").catch(() => {});

    const streamUrl = this.getDownloadUrl(videoId);
    let blob: Blob | null = null;

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(streamUrl, { headers: { ...authHeader } });
      if (res.ok) blob = await res.blob();
    } catch (err) {
      console.warn("[videoInteractivityService] Backend stream fetch failed:", err);
    }

    if (!blob && fallbackUrl) {
      try {
        const fallbackRes = await fetch(fallbackUrl, { mode: "cors" });
        if (fallbackRes.ok) blob = await fallbackRes.blob();
      } catch (err) {
        console.warn("[videoInteractivityService] Direct video fallback failed:", err);
      }
    }

    if (!blob) {
      const link = document.createElement("a");
      link.href = streamUrl;
      link.download = filename;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
    }, 2000);
  },
};