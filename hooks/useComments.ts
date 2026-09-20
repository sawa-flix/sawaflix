import { useState, useCallback, useEffect } from 'react';
import { youtubeApi } from '@/services/youtubeApi';
import { videoInteractivityService } from '@/services/videoInteractivityService';
import type { Comment } from '@/types/youtube';

interface UseCommentsResult {
    comments: Comment[];
    loading: boolean;
    error: string | null;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    refetch: () => Promise<void>;
    addComment: (comment: Comment) => void;
    toggleCommentLike: (commentId: string, isReply?: boolean, parentId?: string) => Promise<void>;
}

const isYouTubeId = (id: string) => /^[A-Za-z0-9_-]{11}$/.test(id);

// ─── Module-level in-memory cache ───────────────────────────────────────────
// Persists comments across reel navigation so users see their own comments
// even after scrolling away and returning to the same reel.
const commentsCache = new Map<string, Comment[]>();

export function useComments(videoId: string | null): UseCommentsResult {
    // Hydrate from cache immediately so comments survive navigation
    const [comments, setComments] = useState<Comment[]>(
        () => (videoId ? commentsCache.get(videoId) ?? [] : [])
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchComments = useCallback(async () => {
        if (!videoId) return;

        setLoading(true);
        setError(null);

        try {
            if (isYouTubeId(videoId)) {
                // For YouTube videos: fetch both YouTube comments AND our Neon
                // community comments in parallel, then merge them.
                const [ytResult, neonResult] = await Promise.allSettled([
                    youtubeApi.getVideoComments(videoId),
                    videoInteractivityService.getComments(videoId, 'top'),
                ]);

                const ytComments: Comment[] = ytResult.status === 'fulfilled' ? ytResult.value : [];
                const neonComments: Comment[] = neonResult.status === 'fulfilled'
                    ? (neonResult.value.comments || []).map((c: any) => ({
                        id: c.id,
                        author: c.userName || 'Community Member',
                        authorProfileImage: c.userAvatar || '',
                        text: c.content,
                        likeCount: c.likesCount || 0,
                        publishedAt: c.createdAt,
                        isLikedByMe: c.isLikedByMe,
                        userRole: c.userRole,
                        parentId: c.parentId,
                        replies: (c.replies || []).map((r: any) => ({
                            id: r.id,
                            author: r.userName || 'Community Member',
                            authorProfileImage: r.userAvatar || '',
                            text: r.content,
                            likeCount: r.likesCount || 0,
                            publishedAt: r.createdAt,
                            isLikedByMe: r.isLikedByMe,
                            userRole: r.userRole,
                            parentId: r.parentId,
                        })),
                        repliesCount: c.repliesCount || (c.replies ? c.replies.length : 0),
                      }))
                    : [];

                // Prepend Neon (community) comments before YouTube comments
                const merged = [...neonComments, ...ytComments];
                commentsCache.set(videoId, merged);
                setComments(merged);
            } else {
                const data = await videoInteractivityService.getComments(videoId);
                const mapped: Comment[] = (data.comments || []).map((c: any) => ({
                    id: c.id,
                    author: c.userName || 'Community Member',
                    authorProfileImage: c.userAvatar || '',
                    text: c.content,
                    likeCount: c.likesCount || 0,
                    publishedAt: c.createdAt,
                    isLikedByMe: c.isLikedByMe,
                    userRole: c.userRole,
                    parentId: c.parentId,
                    replies: (c.replies || []).map((r: any) => ({
                        id: r.id,
                        author: r.userName || 'Community Member',
                        authorProfileImage: r.userAvatar || '',
                        text: r.content,
                        likeCount: r.likesCount || 0,
                        publishedAt: r.createdAt,
                        isLikedByMe: r.isLikedByMe,
                        userRole: r.userRole,
                        parentId: r.parentId,
                    })),
                    repliesCount: c.repliesCount || (c.replies ? c.replies.length : 0),
                }));
                commentsCache.set(videoId, mapped);
                setComments(mapped);
            }
            setHasFetched(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
            // Only surface the error state if we have nothing cached to show.
            // Network failures (Render cold-start, offline) should degrade silently.
            if (!commentsCache.has(videoId ?? '')) {
                setError(errorMessage);
            }
            // Warn-level so it doesn't appear as a red "issue" in the browser overlay
            console.warn('[useComments] fetch degraded (backend may be waking up):', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        if (!videoId) return;
        // Show cached comments immediately, then refresh in background
        if (commentsCache.has(videoId)) {
            setComments(commentsCache.get(videoId)!);
        }
        fetchComments();
    }, [videoId, fetchComments]);

    const handleSetIsOpen = useCallback((open: boolean) => {
        setIsOpen(open);
        if (open && !hasFetched) {
            fetchComments();
        }
    }, [fetchComments, hasFetched]);

    const refetch = useCallback(async () => {
        setHasFetched(false);
        await fetchComments();
    }, [fetchComments]);

    const addComment = useCallback((comment: Comment) => {
        setComments(prev => {
            if (comment.parentId) {
                return prev.map(c => {
                    if (c.id === comment.parentId) {
                        const nextReplies = [...(c.replies || []), comment];
                        return {
                            ...c,
                            replies: nextReplies,
                            repliesCount: nextReplies.length,
                        };
                    }
                    return c;
                });
            }
            return [comment, ...prev];
        });
    }, []);

    const toggleCommentLike = useCallback(async (commentId: string, isReply = false, parentId?: string) => {
        setComments(prev =>
            prev.map(c => {
                if (!isReply && c.id === commentId) {
                    const nextLiked = !c.isLikedByMe;
                    return {
                        ...c,
                        isLikedByMe: nextLiked,
                        likeCount: Math.max(0, (c.likeCount || 0) + (nextLiked ? 1 : -1)),
                    };
                }
                if (isReply && c.id === parentId) {
                    return {
                        ...c,
                        replies: (c.replies || []).map(r => {
                            if (r.id === commentId) {
                                const nextLiked = !r.isLikedByMe;
                                return {
                                    ...r,
                                    isLikedByMe: nextLiked,
                                    likeCount: Math.max(0, (r.likeCount || 0) + (nextLiked ? 1 : -1)),
                                };
                            }
                            return r;
                        }),
                    };
                }
                return c;
            })
        );

        if (videoId && !isYouTubeId(videoId)) {
            try {
                await videoInteractivityService.toggleCommentLike(commentId);
            } catch (err) {
                console.error('[useComments] toggleCommentLike failed:', err);
                fetchComments();
            }
        }
    }, [videoId, fetchComments]);

    return {
        comments,
        loading,
        error,
        isOpen,
        setIsOpen: handleSetIsOpen,
        refetch,
        addComment,
        toggleCommentLike,
    };
}