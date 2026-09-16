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
            if (isYouTubeId(videoId)) {
                const commentsList = await youtubeApi.getVideoComments(videoId);
                setComments(commentsList);
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
                setComments(mapped);
            }
            setHasFetched(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
            setError(errorMessage);
            console.error('[useComments] Error:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        if (videoId) fetchComments();
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