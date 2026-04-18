import type { VideoSearchResponse, VideoDetails, Comment } from '@/types/youtube';
import { searchVideosAction, getVideoDetailsAction, getVideoCommentsAction } from '@/app/actions/youtube';

export class YouTubeApiService {
    async searchVideos(
        query: string,
        pageToken: string | null = null,
        maxResults: number = 7
    ): Promise<VideoSearchResponse> {
        console.log('[API] Invoking server action to fetch videos for:', query);
        return searchVideosAction(query, pageToken, maxResults);
    }

    async getVideoDetails(videoId: string): Promise<VideoDetails> {
        console.log('[API] Invoking server action to fetch details for:', videoId);
        return getVideoDetailsAction(videoId);
    }

    async getVideoComments(videoId: string): Promise<Comment[]> {
        console.log('[API] Invoking server action to fetch comments for:', videoId);
        return getVideoCommentsAction(videoId);
    }
}

export const youtubeApi = new YouTubeApiService();