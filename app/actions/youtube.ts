'use server';

import type { VideoSearchResponse, VideoDetails, Comment } from '@/types/youtube';
import { BACKEND_URL } from '@/lib/apiConfig';

const API_BASE_URL = BACKEND_URL || 'http://localhost:5000';

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
