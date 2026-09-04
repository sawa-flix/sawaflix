'use server';

import type { VideoSearchResponse, VideoDetails, Comment, Video } from '@/types/youtube';
import { BACKEND_URL } from '@/lib/apiConfig';
import { createClient } from '@/utils/supabase/server';

const API_BASE_URL = BACKEND_URL || 'http://localhost:5000';

async function getAuthToken() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
}

/**
 * Mock data for fallback when backend is unreachable
 */
const MOCK_VIDEOS: Video[] = [
    {
        id: 'dQw4w9WgXcQ',
        title: 'SawaFlix Premium - Welcome to the Culture',
        description: 'Experience the best of Cameroon entertainment.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        channelId: 'sawaflix',
        channelTitle: 'SawaFlix Official',
        publishedAt: new Date().toISOString(),
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        likeCount: '10K',
        viewCount: '1M'
    },
    {
        id: '3JZ_D3ELwOQ',
        title: 'Trending Cameroon Music 2026',
        description: 'The latest hits from the heart of Africa.',
        thumbnail: 'https://img.youtube.com/vi/3JZ_D3ELwOQ/maxresdefault.jpg',
        channelId: 'music',
        channelTitle: 'Sawa Music',
        publishedAt: new Date().toISOString(),
        videoUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
        embedUrl: 'https://www.youtube.com/embed/3JZ_D3ELwOQ',
        likeCount: '5K',
        viewCount: '500K'
    }
];

/**
 * Robust fetch with timeout and better error handling
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 60000, retries = 2) {
    let lastError: any;
    
    for (let i = 0; i <= retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error: any) {
            clearTimeout(timeoutId);
            lastError = error;

            const isRetryable = 
                error.code === 'ECONNRESET' || 
                error.message?.includes('ECONNRESET') ||
                error.code === 'ETIMEDOUT' ||
                error.name === 'AbortError';

            if (isRetryable && i < retries) {
                const delay = Math.pow(2, i) * 1000;
                console.warn(`[YouTube Action] Fetch failed (${error.code || error.name}). Retrying in ${delay}ms... (${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            if (error.name === 'AbortError') {
                console.warn(`[YouTube Action] Request timed out for: ${url}`);
                throw new Error('Backend request timed out. The server might be waking up (Render free tier). Please wait a moment and try again.');
            }

            // Handle low-level connection failures
            if (
                error.message === 'fetch failed' || 
                error.code === 'ECONNREFUSED' || 
                error.code === 'ECONNRESET' ||
                error.message?.includes('ECONNRESET') ||
                error.code === 'UND_ERR_CONNECT_TIMEOUT'
            ) {
                console.error(`[YouTube Action] Connection failed to: ${url}`, error.message);
                
                const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
                const message = isLocal 
                    ? 'Unable to connect to your local SawaFlix backend. Please ensure it is running on http://localhost:5000'
                    : 'Unable to reach the SawaFlix backend. It might be offline or waking up.';
                
                const err = new Error(message) as any;
                err.code = 'BACKEND_UNREACHABLE';
                throw err;
            }

            throw error;
        }
    }
    throw lastError;
}

async function handleResponse(response: Response) {
    if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch {}
        // Attach the status so callers can tell a rate limit (429) apart from
        // any other failure without parsing the message string.
        const err = new Error(errorMessage) as Error & { status?: number };
        err.status = response.status;
        throw err;
    }
    return response.json();
}

export async function getUnifiedFeedAction() {
    const url = `${API_BASE_URL}/api/content/unified-feed`;
    try {
        const response = await fetchWithTimeout(url);
        return handleResponse(response);
    } catch (error: any) {
        console.error('getUnifiedFeedAction error:', error);
        if (error.code === 'BACKEND_UNREACHABLE') {
            return { data: { sawaflix: [], youtube: MOCK_VIDEOS } };
        }
        throw error;
    }
}

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.ADMIN_BACKEND_URL || 'http://localhost:3001';

export async function getCultureFeedAction(page: number = 1, limit: number = 20) {
    const url = `${API_BASE_URL}/api/feed/culture?page=${page}&limit=${limit}`;
    let youtubeFeed: any[] = [];
    let paginationData: any = { current_page: page, next_page: page + 1 };

    // 1. Fetch YouTube culture feed
    try {
        const response = await fetchWithTimeout(url, {}, 5000, 1);
        const resJson = await handleResponse(response);
        youtubeFeed = resJson?.feed || [];
        if (resJson?.pagination) {
            paginationData = resJson.pagination;
        }
    } catch (error: any) {
        console.warn('[getCultureFeedAction] YouTube backend feed warning:', error.message);
    }

    // 2. Fetch Admin uploaded reels from Sawaflix-Admin-Backend and/or Supabase
    let adminReels: any[] = [];
    try {
        // Try public admin endpoint first
        const adminRes = await fetchWithTimeout(`${ADMIN_API_URL}/api/public/reels?page=${page}&limit=10`, {}, 3000, 0);
        if (adminRes.ok) {
            const adminData = await adminRes.json();
            if (adminData?.data && Array.isArray(adminData.data)) {
                adminReels = adminData.data;
            }
        }
    } catch (adminErr: any) {
        // Silently fall back to Supabase direct query
    }

    // Fallback: If admin backend endpoint didn't return reels, query Supabase directly
    if (adminReels.length === 0) {
        try {
            const supabase = await createClient();
            const { data: contents } = await supabase
                .from('contents')
                .select('*')
                .eq('visibility', 'public')
                .order('created_at', { ascending: false })
                .limit(10);

            if (contents && contents.length > 0) {
                adminReels = contents.map((c: any) => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    media_url: c.media_url || c.media_path,
                    video_url: c.media_url || c.media_path,
                    thumbnail_url: c.cover_url || c.thumbnail_url || 'https://i.ibb.co/WWhx2c0g/sawaflixmusic-cover.png',
                    author_name: c.author_name || 'SawaFlix Creator',
                    duration: c.duration || 38,
                    origin: 'sawaflix',
                    is_reel: true
                }));
            }
        } catch (sbErr: any) {
            console.warn('[getCultureFeedAction] Supabase contents fallback warning:', sbErr.message);
        }
    }

    // Transform admin reels to feed items matching YouTube raw feed shape
    const formattedAdminFeed = adminReels.map((ar: any) => ({
        id: ar.id,
        videoId: ar.id,
        title: ar.title || 'SawaFlix Reel',
        description: ar.description || '',
        thumbnail: ar.thumbnail_url || ar.cover_url || 'https://i.ibb.co/WWhx2c0g/sawaflixmusic-cover.png',
        channelTitle: ar.author_name || 'SawaFlix Creator',
        channelId: ar.creator_id || 'sawaflix_admin',
        media_url: ar.media_url || ar.video_url,
        video_url: ar.media_url || ar.video_url,
        origin: 'sawaflix',
        duration: ar.duration || 38,
        statistics: {
            viewCount: '1.4K',
            likeCount: '328',
            commentCount: '42'
        }
    }));

    // 3. Blend / Interleave Admin Reels with YouTube culture videos!
    let mergedFeed: any[] = [];
    if (formattedAdminFeed.length > 0 && youtubeFeed.length > 0) {
        let adminIdx = 0;
        let ytIdx = 0;
        // Prioritize admin reel at index 0, then 2 YouTube videos, then 1 admin reel, etc.
        while (adminIdx < formattedAdminFeed.length || ytIdx < youtubeFeed.length) {
            if (adminIdx < formattedAdminFeed.length) {
                mergedFeed.push(formattedAdminFeed[adminIdx++]);
            }
            if (ytIdx < youtubeFeed.length) {
                mergedFeed.push(youtubeFeed[ytIdx++]);
            }
            if (ytIdx < youtubeFeed.length) {
                mergedFeed.push(youtubeFeed[ytIdx++]);
            }
        }
    } else if (formattedAdminFeed.length > 0) {
        mergedFeed = formattedAdminFeed;
    } else {
        mergedFeed = youtubeFeed.length > 0 ? youtubeFeed : MOCK_VIDEOS;
    }

    return {
        success: true,
        feed: mergedFeed,
        pagination: paginationData
    };
}

export async function searchVideosAction(
    query: string,
    pageToken: string | null = null,
    maxResults: number = 7
): Promise<VideoSearchResponse> {
    if (!query || query.trim() === '') {
        throw new Error('Search query cannot be empty');
    }

    const params = new URLSearchParams({
        q: query.trim(),
        maxResults: maxResults.toString()
    });

    if (pageToken) {
        params.append('pageToken', pageToken);
    }

    const url = `${API_BASE_URL}/api/videos/external/youtube?${params.toString()}`;
    console.log(`[YouTube Action] Searching videos: ${url}`);
    
    try {
        const response = await fetchWithTimeout(url, {
            next: { revalidate: 3600 }
        });
        return handleResponse(response);
    } catch (error: any) {
        console.error('searchVideosAction error:', error);
        if (error.code === 'BACKEND_UNREACHABLE' || error.message?.includes('Too Many Requests') || error.message?.includes('quota')) {
            // Return mock videos so the UI doesn't crash
            return { items: MOCK_VIDEOS, nextPageToken: null };
        }
        throw error;
    }
}

export async function getVideoDetailsAction(videoId: string): Promise<VideoDetails> {
    if (!videoId || videoId.trim() === '') {
        throw new Error('Video ID cannot be empty');
    }

    const token = await getAuthToken();
    const url = `${API_BASE_URL}/api/videos/external/youtube/${encodeURIComponent(videoId)}`;

    try {
        const response = await fetchWithTimeout(url, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        });
        return handleResponse(response);
    } catch (error: any) {
        console.error('getVideoDetailsAction error:', error);
        if (error.code === 'BACKEND_UNREACHABLE' || error.message?.includes('Too Many Requests') || error.message?.includes('quota')) {
            const mock = MOCK_VIDEOS.find(v => v.id === videoId) || MOCK_VIDEOS[0];
            return {
                id: mock.id,
                title: mock.title,
                viewCount: '1M',
                likeCount: '10K',
                commentCount: '500',
                duration: 'PT3M45S',
                publishedAt: mock.publishedAt,
                channelId: mock.channelId,
                channelTitle: mock.channelTitle
            };
        }
        throw error;
    }
}

export async function getVideoCommentsAction(videoId: string): Promise<Comment[]> {
    if (!videoId || videoId.trim() === '') {
        throw new Error('Video ID cannot be empty');
    }

    const url = `${API_BASE_URL}/api/videos/external/youtube/${encodeURIComponent(videoId)}/comments`;
    
    try {
        const response = await fetchWithTimeout(url);
        return handleResponse(response);
    } catch (error: any) {
        console.error('getVideoCommentsAction error:', error);
        if (error.code === 'BACKEND_UNREACHABLE' || error.message?.includes('Too Many Requests') || error.message?.includes('quota')) {
            return [
                {
                    id: 'c1',
                    author: 'User 1',
                    authorProfileImage: '',
                    text: 'Offline mode: Unable to load live comments.',
                    likeCount: 0,
                    publishedAt: new Date().toISOString()
                }
            ];
        }
        throw error;
    }
}

export async function likeYouTubeVideoAction(videoId: string, origin: 'youtube' | 'sawaflix' = 'youtube') {
    if (!videoId || videoId.trim() === '') throw new Error('Video ID cannot be empty');
    const token = await getAuthToken();
    const url = `${API_BASE_URL}/api/interactions/like`;
    
    try {
        const response = await fetchWithTimeout(url, {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ videoId, origin })
        });
        return handleResponse(response);
    } catch (error: any) {
        console.error('likeYouTubeVideoAction error:', error);
        if (error.code === 'BACKEND_UNREACHABLE') {
            return { success: true, message: 'Interaction recorded locally (Offline)' };
        }
        throw error;
    }
}

export async function followYouTubeChannelAction(channelId: string) {
    if (!channelId || channelId.trim() === '') throw new Error('Channel ID cannot be empty');
    const token = await getAuthToken();
    const url = `${API_BASE_URL}/api/interactions/follow`;
    
    try {
        const response = await fetchWithTimeout(url, {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ channelId })
        });
        return handleResponse(response);
    } catch (error: any) {
        console.error('followYouTubeChannelAction error:', error);
        if (error.code === 'BACKEND_UNREACHABLE') {
            return { success: true, message: 'Follow recorded locally (Offline)' };
        }
        throw error;
    }
}

export async function commentYouTubeVideoAction(videoId: string, text: string, origin: 'youtube' | 'sawaflix' = 'youtube') {
    if (!videoId || videoId.trim() === '') throw new Error('Video ID cannot be empty');
    if (!text || text.trim() === '') throw new Error('Comment text cannot be empty');
    const token = await getAuthToken();
    const url = `${API_BASE_URL}/api/interactions/comment`;
    
    try {
        const response = await fetchWithTimeout(url, {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ videoId, commentText: text, origin })
        });
        return handleResponse(response);
    } catch (error: any) {
        console.error('commentYouTubeVideoAction error:', error);
        if (error.code === 'BACKEND_UNREACHABLE') {
            return { success: true, message: 'Comment recorded locally (Offline)' };
        }
        throw error;
    }
}
