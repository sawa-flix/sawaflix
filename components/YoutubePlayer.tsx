/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useRef, useState } from 'react';

interface YouTubePlayerProps {
    videoId: string;
    isActive: boolean;
    isMuted: boolean;
    onProgress?: (progress: number, timeLeft: string) => void;
    onPlayerReady?: (player: YT.Player) => void;
}

declare global {
    interface Window {
        YT: typeof YT;
        onYouTubeIframeAPIReady: () => void;
    }
}

export function YouTubePlayer({
    videoId,
    isActive,
    isMuted,
    onProgress,
    onPlayerReady
}: YouTubePlayerProps) {
    const playerRef = useRef<YT.Player | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [apiLoaded, setApiLoaded] = useState(false);

    // Load YouTube API
    useEffect(() => {
        if (window.YT && window.YT.Player) {
            setApiLoaded(true);
            return;
        }

        window.onYouTubeIframeAPIReady = () => {
            setApiLoaded(true);
        };

        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    // Initialize player when needed
    useEffect(() => {
        if (!apiLoaded) return;
        if (!containerRef.current) return;

        // Only create player if it doesn't exist AND video is active
        if (!playerRef.current && isActive) {
            console.log('[Player] Creating player for:', videoId);

            playerRef.current = new window.YT.Player(containerRef.current, {
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    mute: isMuted ? 1 : 0,
                    controls: 0,
                    rel: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    enablejsapi: 1,
                    origin: window.location.origin,
                    playsinline: 1,
                },
                events: {
                    onReady: (event: YT.PlayerEvent) => {
                        console.log('[Player] Ready for:', videoId);
                        setIsPlayerReady(true);
                        onPlayerReady?.(event.target);
                        if (isActive) {
                            event.target.playVideo();
                        }
                    },
                    onStateChange: (event: YT.OnStateChangeEvent) => {
                        if (event.data === YT.PlayerState.ENDED) {
                            console.log('[Player] Video ended:', videoId);
                        }
                    },
                    onError: (event: YT.OnErrorEvent) => {
                        console.error('[Player] Error for', videoId, ':', event.data);
                    },
                },
            });
        }

        // Control playback based on active state
        if (playerRef.current && isPlayerReady) {
            if (isActive) {
                console.log('[Player] Playing active video:', videoId);
                playerRef.current.playVideo();
                // Ensure mute state is correct
                if (isMuted) {
                    playerRef.current.mute();
                } else {
                    playerRef.current.unMute();
                }
            } else {
                console.log('[Player] Pausing inactive video:', videoId);
                playerRef.current.pauseVideo();
            }
        }

        return () => {
            // Don't destroy player immediately, just pause it
            if (playerRef.current && !isActive) {
                playerRef.current.pauseVideo();
            }
        };
    }, [apiLoaded, isActive, videoId, isMuted, onPlayerReady, isPlayerReady]);

    // Update mute state and ensure only active video plays
    useEffect(() => {
        if (playerRef.current && isPlayerReady) {
            if (isMuted) {
                playerRef.current.mute();
            } else {
                playerRef.current.unMute();
            }

            // If this video becomes unmuted but is not active, pause it immediately
            if (!isMuted && !isActive) {
                console.log('[Player] Inactive video unmuted - pausing:', videoId);
                playerRef.current.pauseVideo();
            }
        }
    }, [isMuted, isPlayerReady, isActive, videoId]);

    // Clean up player when component unmounts or video changes significantly
    useEffect(() => {
        return () => {
            if (playerRef.current) {
                console.log('[Player] Destroying player for:', videoId);
                playerRef.current.stopVideo();
                playerRef.current.destroy();
                playerRef.current = null;
                setIsPlayerReady(false);
            }
        };
    }, [videoId]);

    // Track progress only for active video
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
                const currentTime = playerRef.current?.getCurrentTime();
                const duration = playerRef.current?.getDuration();

                if (currentTime !== undefined && duration !== undefined && duration > 0) {
                    const progressPercent = (currentTime / duration) * 100;
                    const remaining = Math.floor(duration - currentTime);
                    const minutes = Math.floor(remaining / 60);
                    const seconds = remaining % 60;
                    const timeLeftFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    onProgress?.(progressPercent, timeLeftFormatted);
                }
            } catch (error) {
                // Silent fail
            }
        }, 1000);

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        };
    }, [isActive, isPlayerReady, onProgress]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full"
            style={{
                pointerEvents: 'none',
                backgroundColor: '#000',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
        />
    );
}