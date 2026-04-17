// hooks/useComments.ts
import { useState, useCallback } from 'react';
import { youtubeApi } from '@/services/youtubeApi';
import type { Comment } from '@/types/youtube';

interface UseCommentsResult {
    comments: Comment[];
    loading: boolean;
    error: string | null;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    refetch: () => Promise<void>;  // ✅ Add refetch to the interface
}

export function useComments(videoId: string | null): UseCommentsResult {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchComments = useCallback(async () => {
        if (!videoId) return;

        setLoading(true);
        setError(null);

        try {
            const commentsList = await youtubeApi.getVideoComments(videoId);
            setComments(commentsList);
            setHasFetched(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
            setError(errorMessage);
            console.error('[useComments] Error:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [videoId]);

    // Fetch when drawer opens
    const handleSetIsOpen = useCallback((open: boolean) => {
        setIsOpen(open);
        if (open && !hasFetched) {
            fetchComments();
        }
    }, [fetchComments, hasFetched]);

    // Refetch function for manual refresh
    const refetch = useCallback(async () => {
        setHasFetched(false); // Reset so it fetches again
        await fetchComments();
    }, [fetchComments]);

    return {
        comments,
        loading,
        error,
        isOpen,
        setIsOpen: handleSetIsOpen,
        refetch,  // ✅ Now refetch is returned
    };
}