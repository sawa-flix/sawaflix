/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useRef, useState } from 'react';

import { PlaybackRestriction } from '@/services/playbackService';

interface YouTubePlayerProps {
    videoId: string;
    isActive: boolean;
    isMuted: boolean;
    isPaused?: boolean;
    restriction?: PlaybackRestriction;
    onProgress?: (progress: number, timeLeft: string, currentTime: number, duration: number) => void;
    onPlayerReady?: (player: YT.Player) => void;
    onRestrictionReached?: () => void;
    onEnded?: () => void;
    /** Raw YT.PlayerState value on every state change — lets a consumer track
     * the player's REAL playing/paused state rather than assume the state it
     * asked for was actually reached (autoplay can be silently blocked). */
    onPlayerStateChange?: (state: number) => void;
}

declare global {
    interface Window {
        YT: typeof YT;
        onYouTubeIframeAPIReady: () => void;
        youtubeCallbacks?: (() => void)[];
    }
}

export function YouTubePlayer({
    videoId,
    isActive,
    isMuted,
    isPaused = false,
    restriction,
    onProgress,
    onPlayerReady,
    onRestrictionReached,
    onEnded,
    onPlayerStateChange
}: YouTubePlayerProps) {
    const playerRef = useRef<YT.Player | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [apiLoaded, setApiLoaded] = useState(false);
    // YouTube error codes 100/101/150 mean the video's owner has disabled
    // embedding (or it's region-restricted) — the IFrame API itself refuses
    // to play it, there is nothing our code can retry. Previously this only
    // logged to the console, leaving a silent blank/black player with no
    // indication to the user of why nothing is playing.
    const [playbackError, setPlaybackError] = useState<number | null>(null);

    // Clear any previous error state whenever we're asked to play a different video
    useEffect(() => {
        setPlaybackError(null);
    }, [videoId]);

    // Initial API Load
    useEffect(() => {
        if (window.YT && window.YT.Player) {
            setApiLoaded(true);
            return;
        }

        if (!window.youtubeCallbacks) {
            window.youtubeCallbacks = [];
            
            window.onYouTubeIframeAPIReady = () => {
                window.youtubeCallbacks?.forEach(cb => cb());
                window.youtubeCallbacks = [];
            };

            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            document.head.appendChild(script);
        }

        window.youtubeCallbacks.push(() => {
            setApiLoaded(true);
        });
    }, []);

    // Initialize/Update Player
    useEffect(() => {
        if (!apiLoaded || !containerRef.current || !videoId) return;

        let player: YT.Player;

        // If player doesn't exist, create it
        if (!playerRef.current) {
            console.log('[Player] Initializing new player instance');
            player = new window.YT.Player(containerRef.current, {
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    controls: 0,
                    rel: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    enablejsapi: 1,
                    origin: window.location.origin,
                    playsinline: 1,
                    showinfo: 0,
                },
                events: {
                    onReady: (event) => {
                        console.log('[Player] Ready Event');
                        setIsPlayerReady(true);
                        playerRef.current = event.target;
                        onPlayerReady?.(event.target);
                        
                        // Attempt to force high quality
                        try {
                            (event.target as any).setPlaybackQuality('hd1080');
                        } catch (e) {}

                        if (isActive) {
                            event.target.playVideo();
                            if (isMuted) {
                                event.target.mute();
                            } else {
                                event.target.unMute();
                            }
                        }
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.UNSTARTED && isActive) {
                            event.target.playVideo();
                        }
                        if (event.data === window.YT.PlayerState.ENDED) {
                            onEnded?.();
                        }
                        onPlayerStateChange?.(event.data);
                    },
                    onError: (event: YT.OnErrorEvent) => {
                        console.error('[Player] Error for', videoId, ':', event.data);
                        setPlaybackError(event.data);
                    },
                },
            });
            playerRef.current = player;
        } else if (isPlayerReady && playerRef.current) {
            // If player exists and ready, handle transitions and reactive updates
            try {
                const currentId = (playerRef.current as any).getVideoData?.()?.video_id;
                if (currentId !== videoId) {
                    console.log('[Player] Loading new video ID');
                    playerRef.current.loadVideoById({
                        videoId: videoId,
                        startSeconds: 0
                    });
                }

                if (isActive && !isPaused) {
                    playerRef.current.playVideo();
                    if (isMuted) playerRef.current.mute();
                    else playerRef.current.unMute();
                } else {
                    playerRef.current.pauseVideo();
                }
            } catch (err) {
                console.warn('[Player] Transition Error:', err);
            }
        }

        return () => {
            // We only destroy the player instance if the component unmounts entirely
            // or if we really need to. Currently keeping it persistent for speed.
        };
    }, [apiLoaded, isActive, isPaused, videoId, isMuted, onPlayerReady, isPlayerReady]);

    // Global cleanup on unmount
    useEffect(() => {
        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (e) {}
                playerRef.current = null;
                setIsPlayerReady(false);
            }
        };
    }, []);

    // Progress tracking
    useEffect(() => {
        if (!isActive || !playerRef.current || !isPlayerReady) {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
            return;
        }

        progressIntervalRef.current = setInterval(() => {
            try {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                    const currentTime = playerRef.current.getCurrentTime();
                    const duration = playerRef.current.getDuration();
                    
                    // Enforce Playback Restriction (Preview Limit)
                    if (restriction?.mustPay && restriction.limitSeconds > 0) {
                        if (currentTime >= restriction.limitSeconds) {
                            playerRef.current.pauseVideo();
                            playerRef.current.seekTo(restriction.limitSeconds, true);
                            onRestrictionReached?.();
                            return;
                        }
                    }

                    if (duration > 0) {
                        const remaining = Math.max(0, Math.floor(duration - currentTime));
                        const mins = Math.floor(remaining / 60);
                        const secs = remaining % 60;
                        const timeLeft = `${mins}:${String(secs).padStart(2, '0')}`;
                        onProgress?.((currentTime / duration) * 100, timeLeft, currentTime, duration);
                    }
                }
            } catch (e) {}
        }, 500);

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [isActive, isPlayerReady, onProgress, restriction, onRestrictionReached]);

    return (
        <div className="w-full h-full relative bg-black">
            <div
                ref={containerRef}
                className="w-full h-full pointer-events-none"
            />
            {/* Fallback for videos the IFrame API refuses to embed (owner
                disabled embedding, or region-restricted) — codes 100/101/150.
                Nothing our code can do about it, so we show why instead of a
                silent blank player. */}
            {playbackError !== null && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 text-center px-6 pointer-events-auto">
                    <p className="text-white/80 text-sm">This video can&apos;t be played here.</p>
                    <a
                        href={`https://www.youtube.com/watch?v=${videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-red-500 hover:text-red-400 underline underline-offset-2"
                    >
                        Watch on YouTube
                    </a>
                </div>
            )}
        </div>
    );
}