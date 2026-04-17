import type { VideoSearchResponse, VideoDetails, Comment } from '@/types/youtube';
import { BACKEND_URL } from '@/lib/apiConfig';

const API_BASE_URL = BACKEND_URL || 'http://localhost:5000';

export class YouTubeApiService {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;

            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch {
            }

            throw new Error(errorMessage);
        }

        return response.json();
    }

    async searchVideos(
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

        const url = `${this.baseUrl}/api/videos/external/youtube?${params.toString()}`;
        console.log('[API] Fetching videos:', url);

        const response = await fetch(url);
        return this.handleResponse<VideoSearchResponse>(response);
    }

    async getVideoDetails(videoId: string): Promise<VideoDetails> {
        if (!videoId || videoId.trim() === '') {
            throw new Error('Video ID cannot be empty');
        }

        const url = `${this.baseUrl}/api/videos/external/youtube/${encodeURIComponent(videoId)}`;
        console.log('[API] Fetching details:', url);

        const response = await fetch(url);
        return this.handleResponse<VideoDetails>(response);
    }

    async getVideoComments(videoId: string): Promise<Comment[]> {
        if (!videoId || videoId.trim() === '') {
            throw new Error('Video ID cannot be empty');
        }

        const url = `${this.baseUrl}/api/videos/external/youtube/${encodeURIComponent(videoId)}/comments`;
        console.log('[API] Fetching comments:', url);

        const response = await fetch(url);
        return this.handleResponse<Comment[]>(response);
    }
}

export const youtubeApi = new YouTubeApiService();