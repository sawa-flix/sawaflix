/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useRef, useState } from 'react';

interface YouTubePlayerProps {
    videoId: string;
    isActive: boolean;
    isMuted: boolean;
    isPaused?: boolean;
    onProgress?: (progress: number, timeLeft: string) => void;
    onPlayerReady?: (player: YT.Player) => void;
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
    onProgress,
    onPlayerReady
}: YouTubePlayerProps) {
    const playerRef = useRef<YT.Player | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [apiLoaded, setApiLoaded] = useState(false);

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
                        if (isActive) {
                            event.target.playVideo();
                            event.target.mute();
                        }
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.UNSTARTED && isActive) {
                            event.target.playVideo();
                        }
<<<<<<< HEAD
                    },
                    onError: (event: YT.OnErrorEvent) => {
                        console.error('[Player] Error for', videoId, ':', event.data);
                    },
                },
            });
        }

        // Control playback based on active state and isPaused
        if (playerRef.current && isPlayerReady) {
            if (isActive && !isPaused) {
                console.log('[Player] Playing active video:', videoId);
                playerRef.current.playVideo();
                // Ensure mute state is correct
                if (isMuted) {
                    playerRef.current.mute();
                } else {
                    playerRef.current.unMute();
                }
            } else {
                console.log('[Player] Pausing video:', videoId);
                playerRef.current.pauseVideo();
=======
                    }
                }
            });
            playerRef.current = player;
        } else if (isPlayerReady) {
            // If player exists and ready, just load the next video
            try {
                const currentId = (playerRef.current as any).getVideoData?.()?.video_id;
                if (currentId !== videoId) {
                    console.log('[Player] Loading new video ID');
                    playerRef.current.loadVideoById({
                        videoId: videoId,
                        startSeconds: 0
                    });
                }

                if (isActive) {
                    playerRef.current.playVideo();
                } else {
                    playerRef.current.pauseVideo();
                }

                if (isMuted) playerRef.current.mute();
                else playerRef.current.unMute();
                
            } catch (err) {
                console.warn('[Player] Transition Error:', err);
>>>>>>> dashboard-revamped
            }
        }

        return () => {
            // We only destroy the player instance if the component unmounts entirely
            // or if we really need to. Currently keeping it persistent for speed.
        };
<<<<<<< HEAD
    }, [apiLoaded, isActive, isPaused, videoId, isMuted, onPlayerReady, isPlayerReady]);
=======
    }, [apiLoaded, videoId, isActive, isPlayerReady, isMuted]);
>>>>>>> dashboard-revamped

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
                    if (duration > 0) {
                        onProgress?.((currentTime / duration) * 100, '');
                    }
                }
            } catch (e) {}
        }, 1000);

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [isActive, isPlayerReady, onProgress]);

    return (
        <div className="w-full h-full relative bg-black">
            <div 
                ref={containerRef} 
                className="w-full h-full pointer-events-none"
            />
            {/* Fallback/Poster overlay if needed could go here */}
        </div>
    );
}