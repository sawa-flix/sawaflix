# Reels V2 — Pre-Rebuild Audit

Phase 2 deliverable. No new Reels code was written for this phase — every path below was verified directly (Read/Grep), not assumed. All Reels-exclusive frontend files were removed in Phase 1; the backend, data layer, and every shared component named here are untouched and currently live in the repo exactly as described.

---

## 1. Data Source Audit — Complete Flow

Reels content is **YouTube video metadata proxied through the external SawaFlix backend**, not a Supabase table. Verified end-to-end:

```
YouTube (owner: SawaFlix backend, not this repo)
  → External backend: https://sawaflix-backend.onrender.com  (env: BACKEND_URL / NEXT_PUBLIC_API_URL)
      GET /api/feed/culture?page=&limit=        ← curated feed, used by the default/home experience
      GET /api/videos/external/youtube?q=...     ← search
      GET /api/videos/external/youtube/:id       ← single video details
      GET /api/videos/external/youtube/:id/comments
      GET /api/content/unified-feed              ← mixed YouTube + native Sawaflix content
      POST /api/interactions/{like,follow,comment}
  → Server Actions: app/actions/youtube.ts ('use server')
      getCultureFeedAction, searchVideosAction, getVideoDetailsAction,
      getVideoCommentsAction, getUnifiedFeedAction, likeYouTubeVideoAction,
      followYouTubeChannelAction, commentYouTubeVideoAction
  → Service wrapper: services/youtubeApi.ts (YouTubeApiService — thin pass-through class)
  → Hook: hooks/useVideos.ts (used by the main dashboard feed, SawaFlix.jsx)
        — OR called directly, as the deleted Reels page.tsx did with getCultureFeedAction()
  → Frontend consumer (SawaFlix.jsx today; Reels tomorrow)
```

**This is the same flow SawaFlix.jsx (the main `/dashboard` feed) already uses.** There is no separate "reels" backend table, endpoint, or content type — reusing `getCultureFeedAction()` directly (as the just-deleted `page.tsx` did) is correct and requires no backend change.

A second, unrelated flow exists for **native (non-YouTube) SawaFlix content** (movies/uploads), driven by `app/api/videos/[id]/route.ts` querying `${BACKEND_URL}/api/content` and Supabase directly for user/session data. Reels does not need this path unless the product wants to mix native uploads into the Reels feed later — flagging it as available, not required.

---

## 2. API Audit — Video-Related

| File | Purpose | Params | Response shape | Auth | Reuse for Reels? |
|---|---|---|---|---|---|
| `app/actions/youtube.ts` → `getCultureFeedAction(page, limit)` | Curated YouTube feed (backend: `/api/feed/culture`) | `page: number, limit: number` | `{ success, feed: RawYouTubeItem[], pagination: { current_page, next_page } }` | none (public) | **Yes — primary source** |
| `app/actions/youtube.ts` → `searchVideosAction(query, pageToken, maxResults)` | Keyword search (backend: `/api/videos/external/youtube`) | `query, pageToken?, maxResults` | `{ items: Video[], nextPageToken }` | none | Yes, if Reels adds category/search filtering later |
| `app/actions/youtube.ts` → `getVideoDetailsAction(videoId)` | Single-video stats (view/like/comment count, duration) | `videoId` | `VideoDetails` | none | Optional — only needed if Reels shows live stats beyond what the feed item already includes |
| `app/actions/youtube.ts` → `getVideoCommentsAction(videoId)` | Real YouTube comments | `videoId` | `Comment[]` | none | Yes, if Reels' comment sheet should show real (not mock) comments |
| `app/actions/youtube.ts` → `likeYouTubeVideoAction`, `followYouTubeChannelAction`, `commentYouTubeVideoAction` | Write interactions (backend: `/api/interactions/*`) | `videoId`/`channelId` + optional text | `{ success, message }` | Bearer token if logged in (optional — falls back gracefully) | Yes — wires the Actions bar's like/follow/comment buttons to real backend calls instead of local-only state |
| `app/actions/youtube.ts` → `getUnifiedFeedAction()` | Mixed YouTube + native Sawaflix feed | none | `{ data: { sawaflix: [], youtube: [] } }` | none | Not needed for Reels (culture feed is the right-sized, YouTube-only source) |
| `app/actions/videos.ts` → `getVideoByIdAction(id)` | Fetch a single video via the internal `/api/videos/:id` route | `id` | Normalized `{id,title,description,thumbnail,videoUrl,...,origin}` | none | Only relevant if Reels needs deep-linking to a specific video by ID (the old page.tsx supported `?id=` — worth preserving) |
| `app/api/videos/[id]/route.ts` | Internal route: resolves a YouTube ID (11 chars) via `getVideoDetailsAction`, else looks up native content via backend `/api/content` | `id` (path) | Normalized video object | Supabase session (optional, for native lookup) | Used indirectly through `getVideoByIdAction` above |
| `app/api/notifications/*` | Push notification CRUD | — | — | Supabase session | Not video-related, ignore |
| `app/api/creator/*`, `app/api/webhooks/sanity` | Creator upload / CMS webhook | — | — | Supabase session / webhook secret | Not relevant to Reels |

**Everything Reels needs already exists.** No new API route or server action is required for a functional rebuild.

---

## 3. YouTube Integration Audit

- **Search**: `searchVideosAction` → backend `/api/videos/external/youtube`.
- **Metadata fetch**: feed items arrive already containing `id`/`videoId`, `snippet.title`, `snippet.description`, `snippet.thumbnails.high.url`, `snippet.channelId`, `snippet.channelTitle`, `snippet.publishedAt`, `statistics.likeCount`, `statistics.commentCount`. Mapped to the canonical `Video` shape by a `mapYouTubeItem()` function duplicated in three places: `hooks/useVideos.ts`, and (until Phase 1's deletion) the Reels `page.tsx`. **This mapper should be extracted to one shared location** (see §6) rather than re-duplicated a third time.
- **Thumbnails**: `snippet.thumbnails.high.url` when present, else a constructed fallback `https://i.ytimg.com/vi/{id}/maxresdefault.jpg`.
- **Video IDs**: stored as plain 11-character YouTube video ID strings on `Video.id`. Feed items sometimes arrive as `{ id: { videoId: '...' } }` (raw YouTube Data API shape) and sometimes as `{ id: '...' }` (already-flattened backend shape) — every consumer defensively branches on `typeof item.id === 'object'`. Any new mapper must keep this check.
- **Embeds/playback**: **YouTube IFrame Player API**, not `<video>` tags and not `react-player`. Confirmed in `components/YoutubePlayer.tsx` — it dynamically injects the `https://www.youtube.com/iframe_api` script, constructs a `new window.YT.Player(...)`, and drives playback imperatively (`playVideo()`, `pauseVideo()`, `mute()`/`unMute()`, `loadVideoById()`, `seekTo()`, `getCurrentTime()`, `getDuration()`, `.destroy()`). It exposes `onPlayerReady`, `onProgress`, `onEnded`, `onPlayerStateChange`, `onRestrictionReached`, and a built-in "can't be played here" fallback UI for error codes 100/101/150 (embedding disabled / region-restricted).
- **Do NOT treat YouTube videos as native `<video>` elements.** There is no `src`/`currentTime`/`HTMLMediaElement` API available — all control must go through `YT.Player`'s postMessage-based methods, exactly as `YoutubePlayer.tsx` already does.

**Recommendation:** Reuse `components/YoutubePlayer.tsx` unmodified as the playback primitive. It is already shared (used by `SawaFlix.jsx`, `ReelsSection.jsx`, and `Modal.jsx` for the main feed / preview-on-hover / movie-detail-modal use cases), already handles the IFrame API lifecycle correctly, and already grew the exact hooks (`onEnded`, `onPlayerStateChange`) that a swipeable feed needs. Building a second wrapper would duplicate a nontrivial amount of IFrame API lifecycle code for no benefit — react-player and a raw `<video>` tag are both wrong for this content type.

---

## 4. Shared Components Audit

| Component | Path | Reels-relevant? |
|---|---|---|
| `YouTubePlayer` | `components/YoutubePlayer.tsx` | **Yes — core playback primitive**, see §3 |
| `FavoriteButton` | `components/common/FavoriteButton.tsx` | Yes — heart/save button wired to `contexts/FavoriteContext`; accepts any `content` shape with `id`/`contentId`/`videoId`, so it drops straight into a Reel's action bar |
| `Modal` | `components/Modal.jsx` | Reference only — shows the established modal chrome (bottom-sheet on mobile, centered on desktop, `bg-[#0F1117]`, `rounded-t-3xl`/`rounded-3xl`) and demonstrates the existing pattern for gating playback behind `playbackService` |
| `FeedSkeleton`, `DashboardHeaderSkeleton`, `StatsSkeleton`, `SidebarSkeleton`, `ProfileFormSkeleton` | `components/Dashboard/Skeletons.jsx` | `FeedSkeleton` (categories pills + hero + grid, `animate-pulse`, `bg-white/5`) is the closest existing loading-state pattern; reuse its visual language (not necessarily the exact markup) for a Reels loading skeleton |
| `PremiumPaywall` | `components/PremiumPaywall.tsx` | Only relevant if Reels should enforce the same pay-gate as movie playback (`playbackService` restriction flow) — optional, not required for a YouTube-only Reels feed since YouTube content has no paywall today |
| `PWAInstallPrompt`, `NotificationPrompt` | `components/*.tsx` | Generic overlays, not Reels-specific, but establish the z-index/backdrop conventions |
| `NotificationToast`, `NotificationItem`, `NotificationBadge`, `NotificationDropdown` | `components/notifications/*.tsx` | Reference for toast/empty-state patterns if Reels needs a "comment sent" or "no reels found" style |
| Lucide icons (`lucide-react`) | used everywhere | Yes — the whole app standardizes on Lucide (`Heart`, `MessageCircle`, `Share2`, `Volume2/VolumeX`, `Play`, `X`, etc.); Reels should keep using Lucide, not `react-icons` (which only appears in the old, already-abandoned `app/(dashboard)/dashboard/contentreels/VideoPlayer.jsx` and `app/(dashboard)/dashboard/reels/VideoPlayer.jsx`, the latter deleted in Phase 1) |
| `SawaflixLogo` | `components/SawaflixLogo.tsx` (used by `ReelsSection.jsx`) | Yes, for a consistent brand watermark instead of hand-rolled `<Image src="/icons/icon-96x96.png">` markup |

No dedicated Button/Card/EmptyState primitive library exists in this codebase — every feature (dashboard, notifications, creator wizard) hand-rolls its own Tailwind markup per component rather than importing a shared `<Button>`/`<Card>`. Reels should follow the same convention (match the visual language via Tailwind classes, not by introducing a new shared UI-kit layer this rebuild doesn't need).

---

## 5. Shared Hooks Audit

| Hook | Path | Purpose | Reuse for Reels? |
|---|---|---|---|
| `useVideos(categoryQuery)` | `hooks/useVideos.ts` | Fetches + paginates + IndexedDB-caches the YouTube feed for the main dashboard; contains the canonical `mapYouTubeItem`/`mapSawaflixItem` | **Partially** — the mapping logic should be reused (extract, see §6), but the hook itself is coupled to the "shuffle for the home feed" behavior (`sort(() => Math.random() - 0.5)` on every refresh), which is wrong for Reels — a swipeable feed needs a **stable** order so the user's position/index doesn't jump. Reels should call `getCultureFeedAction` directly (as the deleted `page.tsx` did) rather than through this hook. |
| `useVideoStats(videoId)` | `hooks/useVideoStats.ts` | Fetches live view/like/comment counts for one video | Optional — only if Reels wants live stats rather than the counts already embedded in the feed item |
| `useComments(videoId)` | `hooks/useComments.ts` | Open/close state + fetch + optimistic-add for a video's real YouTube comments | **Yes** — directly replaces the old Reels system's hardcoded demo comment array with real backend comments, and already has the exact `isOpen`/`setIsOpen`/`addComment` shape a comments sheet needs |
| `useNotifications` | `hooks/useNotifications.ts` | Realtime Supabase notification subscription | Not relevant to Reels |

**No `useAuth`, `useUser`, `useInfiniteScroll`, `useIntersectionObserver`, `useWindowSize`, `useMediaQuery`, or `useTheme` hook exists anywhere in this codebase.** Every page that needs the current user calls `supabase.auth.getUser()` inline (see `app/(dashboard)/dashboard/page.tsx`); every page that needs a desktop/mobile breakpoint check (the old Reels system included) hand-rolls its own `window.innerWidth >= 1024` + `resize` listener. This is a real gap but not one Reels should fix unilaterally — recommend inlining the same pattern the rest of the app uses (consistency over introducing a new shared hook this phase didn't ask for).

---

## 6. Shared Utilities Audit

| Utility | Path | Reuse for Reels? |
|---|---|---|
| `formatCount(num)` | `utils/formatCount.ts` | **Yes** — formats like/comment/view counts as `1.2K`/`3.4M`; the old Reels `Actions` component hardcoded strings like `"24.5K"` instead of using this. Should be wired in for the rebuild. |
| `createClient()` (browser + server variants) | `utils/supabase/client.ts`, `utils/supabase/server.ts` | Yes, only if Reels' like/comment/follow actions need the current session token (already handled for you inside the server actions in §2 via `getAuthToken()`) |
| `BACKEND_URL` | `lib/apiConfig.js` | Yes — the single source of truth for the backend origin; already used throughout §1's flow |
| `startVideoPreload()`, `getCachedVideoMetadata()`, `removeCachedVideo()` | `lib/videoPreloader.ts` | **Not applicable to YouTube content** — this preloader fetches raw video *blobs* into IndexedDB for **native Sawaflix** `videoUrl`s (offline playback). YouTube embeds are iframes with no directly fetchable media URL, so this cannot and should not be reused for Reels; the Service Worker's own video-cache tier (§9) already covers YouTube-adjacent caching at a different layer. |
| `mapYouTubeItem` (currently duplicated in `hooks/useVideos.ts` and, until Phase 1, the Reels `page.tsx`) | — | Should be **extracted to a single shared function**, e.g. `lib/youtube/mapYouTubeItem.ts`, imported by both `useVideos.ts` and the new Reels data-fetching code, instead of copy-pasted a third time. This is the one piece of "shared utility" that doesn't yet exist as a standalone, reusable unit — flagging it as a small, justified addition in the rebuild rather than a violation of "don't recreate what exists." |

---

## 7. Types Audit

| Type | Path | Covers | Reuse for Reels? |
|---|---|---|---|
| `Video` | `types/youtube.ts` | `{id, title, description, thumbnail, channelId, channelTitle, publishedAt, videoUrl, embedUrl, likeCount?, commentCount?, viewCount?, contentType?, origin?: 'youtube'\|'sawaflix'}` | **Yes — the canonical shape**, already what `getCultureFeedAction`'s mapped output produces |
| `VideoSearchResponse`, `VideoDetails`, `Comment` | `types/youtube.ts` | Search pagination, single-video stats, one comment | Yes, wherever those respective APIs (§2) are used |
| `ApiError`, `ApiResponse<T>` | `types/youtube.ts` | Generic error/response envelopes | Optional, generic helpers |
| `Category` | `types/youtube.ts` | `{id, label, query}` for category pills | Only if Reels adds category filtering |
| `ParsedDuration` | `types/youtube.ts` | Duration formatting helper shape | Only if Reels displays video duration |
| `User`, `Movie`, `ApiResponse<T>`, `MoviesFilter` | `types/app.ts` | A **second, unrelated** `Movie`/`ApiResponse` type family used by the native-content (non-YouTube) side of the app | Not relevant — don't confuse with `types/youtube.ts`'s `Video`; there is no need to reconcile these two type families for a YouTube-only Reels rebuild |
| `PlaybackRestriction`, `PlaybackResponse` | `services/playbackService.ts` | Pay-gate/restriction shape | Only if Reels reuses the paywall flow (§4, optional) |

---

## 8. Existing UI Patterns Reels Should Match

Verified directly from `app/globals.css` and the components read above:

- **Palette**: `--background: #0B0E14` (near-black), `--foreground: #F8FAFC`, `--primary`/`--accent: #E50914` (the "Netflix-like red" per the CSS's own comment; some components instead use `#CE1126`/`#FF2E2E`/`#D50000` variants — treat `#E50914` as canonical, others as historical drift), `--card-bg: #151C25`.
- **Font**: `var(--font-inter)` (Inter), sans-serif fallback.
- **Scrollbars**: `.scrollbar-hide` / `.no-scrollbar` utility classes already exist globally — the old Reels `ProgressBar`/feed container correctly used these rather than inventing new ones; keep doing so.
- **Cards/surfaces**: consistently `rounded-xl`/`rounded-2xl`/`rounded-3xl`, `bg-[#151B2E]`/`bg-[#1a2238]`/`bg-white/5`, subtle `border-white/10`, `backdrop-blur-*` on floating chrome (buttons, modals).
- **Buttons**: solid red (`bg-[#E50914]`/`bg-red-600`) for primary actions, `bg-white/10` translucent for secondary/icon buttons, `active:scale-95` micro-interaction.
- **Loading**: `animate-pulse` + `bg-white/5`/`bg-gray-800` skeleton blocks (never a spinner-only screen) is the house style — see `Skeletons.jsx`.
- **Animations**: `framer-motion` (`motion.div`, `AnimatePresence`) is the standard, used in 50+ files including `FavoriteButton`, `DashboardLanding`, and the old Reels overlay/comments-sheet. Continue using it — it's a core, actively-used dependency, not a Reels-only import.
- **Empty/error states**: short centered message + muted icon + one-line explanation (e.g. `DashboardLanding`'s "No reels found for this category", the deleted Reels feed's own empty state) — keep this minimal pattern rather than inventing a heavier one.

Reels already looked visually consistent with this system before Phase 1 (it was explicitly redesigned twice this session to match a TikTok/Instagram reference while keeping SawaFlix's palette) — the rebuild should preserve that, not start from a different visual language.

---

## 9. Performance Audit

- **Infinite scroll / pagination**: no dedicated hook; `useVideos.ts`'s `loadMore()` + `hasMore` + a `nextPageTokenRef` is the existing pattern (page-number pagination for the culture feed, YouTube `pageToken` pagination for search). Reels' old system fetched a fixed batch (`getCultureFeedAction(1, 20)`) once server-side with no client-side "load more" — worth adding `loadMore` for a true infinite swipe feed, following `useVideos.ts`'s existing token-vs-page-number branching rather than inventing a new pagination convention.
- **Lazy loading / virtualization**: no shared virtualization library (no `react-window`/`react-virtual` in `package.json`). The old Reels system's homegrown ±1-index windowing (mount current±1, render placeholders elsewhere) is the only precedent in this codebase and is a reasonable, dependency-free approach to keep.
- **Image optimization**: `next/image` used throughout (`next.config.mjs`'s `images.remotePatterns` already whitelists `ytimg.com`, `img.youtube.com`, `googleusercontent.com`, `dicebear.com`, `supabase.co`, `sanity.io`, `ibb.co`, `cloudinary.com`) — thumbnails and avatars should go through `next/image`, not raw `<img>`, exactly as `ReelsSection.jsx` and `DashboardLanding.tsx` already do.
- **Caching**: real, already-configured **Service Worker** caching (`app/sw.ts`, Serwist) — verified three runtime-caching tiers:
  1. `StaleWhileRevalidate` for `/api/content*` and `/api/videos*` (24h) — covers Reels' own data-fetch calls if routed through an API route rather than only a Server Action (Server Actions aren't interceptable by the SW the same way; if Reels' fetching goes through `getCultureFeedAction` server-side, this tier doesn't apply to it directly, but any client-side re-fetch of `/api/videos/:id` would benefit).
  2. `CacheFirst` for `ytimg.com`/image hosts (30 days) — Reels thumbnails benefit automatically, no extra work needed.
  3. `CacheFirst` + `RangeRequestsPlugin` for `youtube.com`/`googlevideo.com`/the video proxy (7 days) — meaning **YouTube iframe traffic already has a caching tier reserved for it** at the PWA level; nothing further is required in application code.
- **IndexedDB video preloading** (`lib/videoPreloader.ts`): explicitly **not applicable** to Reels — it downloads raw blobs for native `videoUrl` content, and YouTube iframes have no fetchable blob URL. Do not attempt to wire this into Reels.
- **Recommendation**: rely on (a) the existing SW cache tiers (already YouTube-aware, zero new code), (b) `next/image` for thumbnails, (c) the ±1 windowing approach for the DOM, and (d) `useVideos.ts`-style page/token pagination for infinite scroll. No new caching or virtualization library is justified.

---

## 10. Architecture Recommendation for Reels V2

This matches and confirms the architecture already validated earlier in this session (`components/reelsV2/`, now removed per Phase 1, but the design itself holds up under this audit):

```
app/(dashboard)/dashboard/reels/page.tsx      — Server Component: calls getCultureFeedAction()
                                                 directly (no separate reels backend/table),
                                                 maps via a shared mapYouTubeItem (see §6)
  → ReelsFeed (client)                        — owns currentIndex (derived from scroll
                                                 position, not IntersectionObserver), mute
                                                 state, manual-pause state, comments-sheet
                                                 open state
    → ReelCard                                — one per video; receives isActive/isPaused
                                                 as props (state lifted to ReelsFeed so
                                                 keyboard shortcuts reach the active card)
      → YouTubePlayer (components/YoutubePlayer.tsx, REUSED UNMODIFIED)
      → Overlay                               — composes Caption/CreatorInfo/Actions/
                                                 ProgressBar; Actions wired to
                                                 FavoriteButton + likeYouTubeVideoAction/
                                                 commentYouTubeVideoAction/
                                                 followYouTubeChannelAction (§2) instead
                                                 of local-only state
    → CommentsSheet                           — backed by useComments(videoId) (§5)
                                                 instead of a hardcoded demo array
```

- **Data flow**: `getCultureFeedAction(page, limit)` → shared `mapYouTubeItem` → `Video[]` → `ReelsFeed` prop. `loadMore()` appends another page using the same token/page-number branching `useVideos.ts` already implements, once the user nears the end of the list.
- **State management**: plain React state in `ReelsFeed`, no Zustand. **Note:** deleting the old Reels store in Phase 1 made `zustand` a fully orphaned dependency — grepping the entire app source (excluding `node_modules`) turns up zero remaining imports of it anywhere. It's flagged here as a "don't recreate" / cleanup candidate for whoever next touches `package.json`, not something this phase should act on.
- **Playback strategy**: exclusivity by construction — only the card at `currentIndex` ever receives `isActive=true`; `YouTubePlayer`'s existing `isActive`/`isPaused` props already map correctly to real `playVideo()`/`pauseVideo()` calls. No manager classes needed.
- **YouTube integration strategy**: `components/YoutubePlayer.tsx`, unmodified — confirmed in §3 to already be the correct, shared, IFrame-API-based wrapper.
- **Folder structure**: a single `components/reels/` directory (`ReelsFeed.tsx`, `ReelCard.tsx`, `Overlay.tsx`, `ProgressBar.tsx`, `Caption.tsx`, `CreatorInfo.tsx`, `Actions.tsx`, `CommentsSheet.tsx`) is sufficient — no `managers/`, no `store/`, no adapter layer. (The old `components/reels/` and `components/reelsV2/` split existed only because the rebuild was being built *alongside* the old system for comparison; with the old system now deleted, there's no reason for two parallel directories anymore.)

---

## Final Deliverables Summary

1. **APIs to reuse**: `getCultureFeedAction`, `searchVideosAction`, `getVideoDetailsAction`, `getVideoCommentsAction`, `likeYouTubeVideoAction`, `followYouTubeChannelAction`, `commentYouTubeVideoAction` — all in `app/actions/youtube.ts`. No new API route needed.
2. **Services to reuse**: `services/youtubeApi.ts` (optional thin wrapper — can call the server actions directly instead), `services/playbackService.ts` (only if paywall-gating is wanted).
3. **Shared hooks to reuse**: `hooks/useComments.ts` (yes, directly); `hooks/useVideoStats.ts` (optional); `hooks/useVideos.ts` (mapping logic only, not the hook itself — see §5/§6).
4. **Shared utilities to reuse**: `utils/formatCount.ts`, `lib/apiConfig.js`'s `BACKEND_URL`, `utils/supabase/{client,server}.ts`.
5. **Shared components to reuse**: `components/YoutubePlayer.tsx`, `components/common/FavoriteButton.tsx`, `components/SawaflixLogo.tsx`; `Skeletons.jsx`'s visual language for a loading state.
6. **Shared types to reuse**: `types/youtube.ts`'s `Video`, `VideoSearchResponse`, `VideoDetails`, `Comment`. Do not touch/reuse `types/app.ts`'s unrelated `Movie` family.
7. **Data flow diagram**: see §1 and §10.
8. **Recommended folder structure**: see §10 (single `components/reels/` directory, no managers/store).
9. **Recommended architecture**: see §10 (ReelsPage → ReelsFeed → ReelCard → YouTubePlayer, scroll-position-derived index, no manager classes).
10. **Risks / compatibility concerns**:
    - `mapYouTubeItem` is currently duplicated (was triplicated before Phase 1's deletion) — extract once during the rebuild rather than copy-pasting a third time.
    - `zustand` is now an orphaned dependency (§10) — informational, not an action item for this phase.
    - The backend (`sawaflix-backend.onrender.com`, Render free tier) can be slow to wake from idle — `fetchWithTimeout`'s existing 60s timeout + retry/backoff already handles this; the rebuild should call the same server actions rather than raw `fetch`, to inherit that resilience for free.
    - No shared `useAuth`/`useMediaQuery` hook exists — the rebuild should inline these checks the same way the rest of the app does, for consistency, not introduce a new shared hook unilaterally.
11. **Should NOT be recreated — already exists**:
    - A YouTube IFrame wrapper (`YoutubePlayer.tsx`) — do not build a second one.
    - A video preloader/offline cache for YouTube content — `lib/videoPreloader.ts` is for native content only and the Service Worker (§9) already covers YouTube caching at the PWA layer.
    - A comments-fetch hook — `useComments.ts` already exists.
    - A count-formatting helper — `formatCount.ts` already exists.
    - A "culture feed" backend endpoint — `/api/feed/culture` already exists and is exactly the right shape for a Reels feed.
