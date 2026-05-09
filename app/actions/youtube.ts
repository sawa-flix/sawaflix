'use server';

import type { VideoSearchResponse, VideoDetails, Comment } from '@/types/youtube';
import { BACKEND_URL } from '@/lib/apiConfig';
import { createClient } from '@/utils/supabase/server';

const API_BASE_URL = BACKEND_URL || 'http://localhost:5000';

async function getAuthToken() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
}

/**
 * Robust fetch with timeout and better error handling
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 60000) {
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
        
        if (error.name === 'AbortError') {
            throw new Error('Backend request timed out. The server might be waking up (Render free tier). Please wait a moment and try again.');
        }

        // Handle low-level connection failures
        if (error.message === 'fetch failed' || error.code === 'ECONNREFUSED' || error.code === 'UND_ERR_CONNECT_TIMEOUT') {
            console.error(`[YouTube Action] Connection failed to: ${url}`, error);
            
            const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
            const message = isLocal 
                ? 'Unable to connect to your local SawaFlix backend. Please ensure it is running on http://localhost:5000'
                : 'Unable to reach the SawaFlix backend. It might be offline or waking up. If you are developing locally, set NEXT_PUBLIC_API_URL to http://localhost:5000 in your .env file.';
            
            throw new Error(message);
        }

        throw error;
    }
}

async function handleResponse(response: Response) {
    if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
    }
    return response.json();
}

export async function getUnifiedFeedAction() {
    const url = `${API_BASE_URL}/api/content/unified-feed`;
    try {
        const response = await fetchWithTimeout(url);
        return handleResponse(response);
    } catch (error) {
        console.error('getUnifiedFeedAction error:', error);
        throw error;
    }
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
    } catch (error) {
        console.error('searchVideosAction error:', error);
        throw error;
    }
}

export async function getVideoDetailsAction(videoId: string): Promise<VideoDetails> {
    if (!videoId || videoId.trim() === '') {
        throw new Error('Video ID cannot be empty');
    }

    const url = `${API_BASE_URL}/api/videos/external/youtube/${encodeURIComponent(videoId)}`;
    
    try {
        const response = await fetchWithTimeout(url);
        return handleResponse(response);
    } catch (error) {
        console.error('getVideoDetailsAction error:', error);
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
    } catch (error) {
        console.error('getVideoCommentsAction error:', error);
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
    } catch (error) {
        console.error('likeYouTubeVideoAction error:', error);
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
    } catch (error) {
        console.error('followYouTubeChannelAction error:', error);
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
    } catch (error) {
        console.error('commentYouTubeVideoAction error:', error);
        throw error;
    }
}
