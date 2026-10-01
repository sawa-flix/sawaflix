"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  MessageCircle,
  MoreHorizontal,
  Share2,
  Bookmark,
  Download,
  Check,
} from "lucide-react";
import type { Video } from "@/types/youtube";
import { likeYouTubeVideoAction } from "@/app/actions/youtube";
import { formatCount } from "@/utils/formatCount";
import { useFavorites } from "@/contexts/FavoriteContext";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useSawaiStore } from "@/store/sawaiStore";

import { videoInteractivityService } from "@/services/videoInteractivityService";
import { patchStatsCache } from "@/hooks/useVideoStats";

interface ReelActionsProps {
  video: Video;
  commentsCount: number;
  realLikeCount?: string | number;
  realIsLiked?: boolean;
  interactors?: { id: string; name: string; avatar: string }[];
  onShowComments: () => void;
}

function parseCount(value: string | number | undefined): number {
  if (value === undefined) return 0;
  const n = typeof value === "number" ? value : parseInt(value, 10);
  return Number.isNaN(n) ? 0 : n;
}

function CameroonSpinner({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className="animate-spin"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="cmr-flag-spinner"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#007A5E" />
          <stop offset="50%" stopColor="#CE1126" />
          <stop offset="100%" stopColor="#FCD116" />
        </linearGradient>
      </defs>
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="url(#cmr-flag-spinner)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="90 40"
      />
    </svg>
  );
}

export function ReelActions({
  video,
  commentsCount,
  realLikeCount,
  realIsLiked,
  interactors,
  onShowComments,
}: ReelActionsProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => parseCount(video.likeCount));
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [, startTransition] = useTransition();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const downloadControllerRef = useRef<AbortController | null>(null);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuthSession();
  const { openAuthModal } = useAuthModal();
  const { toggleSawai } = useSawaiStore();

  const saved = isFavorite(video.id);
  const isNative =
    video.origin === "sawaflix" ||
    (Boolean(video.id) && video.id.length !== 11);

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (realIsLiked !== undefined) {
      setLiked(realIsLiked);
      hydratedRef.current = true;
    }
    if (realLikeCount !== undefined) {
      setLikeCount(parseCount(realLikeCount));
    }
  }, [realIsLiked, realLikeCount]);

  useEffect(() => {
    return () => {
      downloadControllerRef.current?.abort();
    };
  }, []);

  const handleLike = () => {
    if (!isAuthenticated) {
      openAuthModal("to like reels");
      return;
    }

    hydratedRef.current = true;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

    startTransition(async () => {
      if (isNative) {
        try {
          const res = await videoInteractivityService.toggleLike(video.id);
          const resolvedLiked =
            typeof res.liked === "boolean" ? res.liked : nextLiked;
          const resolvedCount =
            typeof res.likesCount === "number" ? res.likesCount : likeCount;
          setLiked(resolvedLiked);
          setLikeCount(resolvedCount);
          patchStatsCache(video.id, {
            isLiked: resolvedLiked,
            likeCount: String(resolvedCount),
          });
        } catch (err) {
          console.error("[ReelActions] SawaFlix Like failed:", err);
          setLiked(!nextLiked);
          setLikeCount((prev) => Math.max(0, prev + (nextLiked ? -1 : 1)));
        }
      } else {
        try {
          await likeYouTubeVideoAction(video.id, video.origin ?? "youtube");
          patchStatsCache(video.id, {
            isLiked: nextLiked,
            likeCount: String(Math.max(0, likeCount + (nextLiked ? 1 : -1))),
          });
        } catch (err) {
          console.error("[ReelActions] Like failed:", err);
          setLiked(!nextLiked);
          setLikeCount((prev) => Math.max(0, prev + (nextLiked ? -1 : 1)));
        }
      }
    });
  };

  // Share: closes the menu (conventional behavior)
  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMoreOpen(false);

    const pageUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://www.sawaflix.com/dashboard/reels?id=${video.id}`;
    const shareTitle = `${video.title || "Watch this on SawaFlix"} | SawaFlix`;
    const shareText = `🎬 ${video.title || "Check this out"}\n\nWatch it on SawaFlix — Africa's home for culture & entertainment 🇨🇲\n\n${pageUrl}\n\n#SawaFlix #CameroonCulture`;

    try {
      if (isNative) {
        videoInteractivityService
          .logShare(video.id, navigator.share ? "native_share" : "copy_link")
          .catch(() => {});
      }

      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: pageUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopyDone(true);
        setTimeout(() => setCopyDone(false), 2000);
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        console.warn("[ReelActions] Share failed:", err);
        try {
          await navigator.clipboard.writeText(pageUrl);
        } catch {}
      }
    }
  };

  // Save: keeps the menu open so the user sees the Saved state
  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuthModal("to save reels to your favorites");
      return;
    }
    toggleFavorite(video);
    // NOTE: intentionally NOT closing the menu — the row will flip
    // between "Save" and "Saved" live so the user sees feedback.
  };

  // Download: keeps the menu open so the user sees loader + %
  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDownloading) return;

    // ⛔️ REMOVED: setIsMoreOpen(false) — menu stays open so the user
    //    sees the live spinner + percentage in place.

    const controller = new AbortController();
    downloadControllerRef.current = controller;
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      await videoInteractivityService.downloadVideoTrack(
        video.id,
        (percent) => setDownloadProgress(percent),
        controller.signal,
      );
    } catch (err) {
      const isAbort =
        (err as { name?: string })?.name === "CanceledError" ||
        (err as { name?: string })?.name === "AbortError" ||
        controller.signal.aborted;

      if (!isAbort) {
        console.error("[ReelActions] Download failed:", err);
        const msg =
          (err as Error)?.message || "Download failed. Please try again.";
        alert(msg);
      }
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
      downloadControllerRef.current = null;
    }
  };

  return (
    <div className="pointer-events-auto absolute bottom-10 right-3 z-20 flex flex-col items-center gap-5">
      {/* Like Button */}
      <button
        type="button"
        onClick={handleLike}
        aria-label={liked ? "Unlike" : "Like"}
        aria-pressed={liked}
        className="group flex cursor-pointer flex-col items-center gap-1 text-white"
      >
        <span
          className={`relative flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-85 ${
            liked
              ? "bg-red-500/20 ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-105"
              : "bg-black/40 hover:bg-black/60"
          }`}
        >
          <Image
            src="/logos_and_pwas/like.png"
            alt="Like"
            width={32}
            height={32}
            priority
            className={`w-7 h-7 object-contain transition-transform duration-200 select-none ${
              liked
                ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                : "opacity-85 group-hover:opacity-100 group-hover:scale-105"
            }`}
          />
        </span>
        <span className="text-xs font-bold drop-shadow font-mono tracking-tight">
          {formatCount(likeCount)}
        </span>
        {interactors && interactors.length > 0 && (
          <div
            className="flex -space-x-1.5 overflow-hidden mt-0.5"
            title={`Interacted by ${interactors.map((i) => i.name).join(", ")}`}
          >
            {interactors.slice(0, 3).map((interactor) => (
              <div
                key={interactor.id}
                className="relative w-4 h-4 rounded-full overflow-hidden border border-black/80 bg-zinc-700 shadow-sm"
              >
                {interactor.avatar ? (
                  <Image
                    src={interactor.avatar}
                    alt={interactor.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[7px] font-black text-white">
                    {interactor.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </button>

      {/* Comment Button */}
      <button
        type="button"
        onClick={() => {
          if (!isAuthenticated) {
            openAuthModal("to view and post comments");
            return;
          }
          onShowComments();
        }}
        aria-label="View comments"
        className="flex cursor-pointer flex-col items-center gap-1 text-white"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md transition-transform active:scale-90">
          <MessageCircle size={24} />
        </span>
        <span className="text-xs font-bold drop-shadow">
          {formatCount(commentsCount)}
        </span>
      </button>

      {/* Sawai AI Assistant */}
      <button
        type="button"
        onClick={toggleSawai}
        aria-label="Ask Sawai"
        className="group flex cursor-pointer flex-col items-center gap-1 text-white"
        title="Ask Sawai AI"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-all group-hover:scale-105 active:scale-90 border border-white/15">
          <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
            <Image
              src="/logos_and_pwas/android-chrome-192x192.png"
              alt="Sawai"
              width={28}
              height={28}
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </span>
        <span className="text-[10px] font-bold drop-shadow tracking-tight uppercase text-zinc-300">
          Sawai
        </span>
      </button>

      {/* More Options Popover */}
      <div className="relative">
        {isMoreOpen && (
          <div
            className="fixed inset-0 z-10 cursor-default"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMoreOpen(false);
            }}
            aria-hidden="true"
          />
        )}

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMoreOpen((prev) => !prev);
          }}
          aria-label="More options"
          aria-haspopup="menu"
          aria-expanded={isMoreOpen}
          className="relative z-20 flex cursor-pointer flex-col items-center gap-1 text-white"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md transition-transform active:scale-90">
            <MoreHorizontal size={24} />
          </span>
        </button>

        {isMoreOpen && (
          <div
            role="menu"
            className="absolute bottom-full right-0 z-30 mb-3 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#181A20] shadow-2xl"
          >
            <button
              type="button"
              role="menuitem"
              onMouseDown={handleShare}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {copyDone ? (
                <Check size={18} className="text-green-400" />
              ) : (
                <Share2 size={18} />
              )}
              {copyDone ? "Link Copied!" : "Share"}
            </button>

            <button
              type="button"
              role="menuitemcheckbox"
              onMouseDown={handleSave}
              aria-checked={saved}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Bookmark size={18} className={saved ? "fill-white" : ""} />
              {saved ? "Saved" : "Save"}
            </button>

            {isNative && (
              <button
                type="button"
                role="menuitem"
                onMouseDown={handleDownload}
                disabled={isDownloading}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <CameroonSpinner size={18} />
                ) : (
                  <Download size={18} />
                )}

                <span className="flex-1 text-left">
                  {isDownloading ? "Downloading" : "Download"}
                </span>

                {isDownloading && (
                  <span className="ml-auto text-xs font-bold tabular-nums text-white/90">
                    {downloadProgress}%
                  </span>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
