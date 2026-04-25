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
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

        const response = await fetch(url, {
            next: { revalidate: 3600 },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage = `HTTP error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch {}
            throw new Error(errorMessage);
        }

        return response.json();
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('The request timed out. The backend might be starting up.');
        }
        console.error('searchVideosAction error:', error);
        throw error;
    }
}

export async function getVideoDetailsAction(videoId: string): Promise<VideoDetails> {
    if (!videoId || videoId.trim() === '') {
        throw new Error('Video ID cannot be empty');
    }

    const url = `${API_BASE_URL}/api/videos/external/youtube/${encodeURIComponent(videoId)}`;
    
    // Cache for 1 hour
    const response = await fetch(url, {
        next: { revalidate: 3600 }
    });

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

export async function getVideoCommentsAction(videoId: string): Promise<Comment[]> {
    if (!videoId || videoId.trim() === '') {
        throw new Error('Video ID cannot be empty');
    }

    const url = `${API_BASE_URL}/api/videos/external/youtube/${encodeURIComponent(videoId)}/comments`;
    
    // Cache for 1 hour
    const response = await fetch(url, {
        next: { revalidate: 3600 }
    });

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

export async function likeYouTubeVideoAction(videoId: string) {
    if (!videoId || videoId.trim() === '') throw new Error('Video ID cannot be empty');
    const token = await getAuthToken();
    const url = `${API_BASE_URL}/api/youtube/like`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ videoId })
    });
    if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try { const errorData = await response.json(); errorMessage = errorData.error || errorMessage; } catch {}
        throw new Error(errorMessage);
    }
    return response.json();
}

export async function followYouTubeChannelAction(channelId: string) {
    if (!channelId || channelId.trim() === '') throw new Error('Channel ID cannot be empty');
    const token = await getAuthToken();
    const url = `${API_BASE_URL}/api/youtube/follow`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ channelId })
    });
    if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try { const errorData = await response.json(); errorMessage = errorData.error || errorMessage; } catch {}
        throw new Error(errorMessage);
    }
    return response.json();
}

export async function commentYouTubeVideoAction(videoId: string, text: string) {
    if (!videoId || videoId.trim() === '') throw new Error('Video ID cannot be empty');
    if (!text || text.trim() === '') throw new Error('Comment text cannot be empty');
    const token = await getAuthToken();
    const url = `${API_BASE_URL}/api/youtube/comment`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ videoId, commentText: text })
    });
    if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try { const errorData = await response.json(); errorMessage = errorData.error || errorMessage; } catch {}
        throw new Error(errorMessage);
    }
    return response.json();
}
