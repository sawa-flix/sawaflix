# Sawaflix Reels Debug & Architecture Audit

**Date:** 2026-07-18  
**Scope:** Inspection only — no code modifications  
**Status:** Complete technical audit of current implementation

---

## 1. Overall Architecture

### Current component chain
```
app/(dashboard)/dashboard/reels/page.tsx
    ↓
ReelsFeed
    ↓
ReelCard
    ↓
VideoPlayer
    ↓
Overlay
```

### Manager and state layer
```
ReelsFeed
  ├─ PlaybackManager
  ├─ AudioManager
  ├─ VisibilityManager
  ├─ GestureManager
  ├─ PreloadManager
  ├─ CacheManager
  └─ Zustand store
```

### How they communicate

- `app/(dashboard)/dashboard/reels/page.tsx` fetches video data and passes it to `components/reelsFeed.tsx`.
- `components/reelsFeed.tsx` is the orchestration layer. It:
  - creates the managers,
  - registers every video element via refs,
  - listens to visibility and store state,
  - updates Zustand through callbacks.
- `components/reels/ReelCard.tsx` renders `components/reels/VideoPlayer.tsx` and `components/reels/Overlay.tsx`.
- `components/reels/VideoPlayer.tsx` is the actual DOM video element wrapper.
- `components/reels/store/reelsStore.ts` is the shared state container for playback/UI state.
- Managers do not receive props from React; they are instantiated inside `components/reelsFeed.tsx` and communicate via:
  - direct DOM refs,
  - callback closures,
  - Zustand store updates.

---

## 2. Playback Audit

### Who calls `video.play()`
- `components/reels/managers/PlaybackManager.ts` calls `video.play()` inside `play()`.
- `components/reelsFeed.tsx` calls `play()` indirectly through the visibility and toggle handlers.
- `components/reelsFeed.tsx` also calls `play()` again from the `canplay` listener on each video element.

### Who calls `video.pause()`
- `components/reels/managers/PlaybackManager.ts` calls `video.pause()` inside `pause()`.
- `components/reels/managers/CacheManager.ts` pauses the video during cleanup.

### When each is called
- On visibility change:
  - `components/reels/managers/VisibilityManager.ts` detects intersection.
  - If intersecting and ratio is at least `0.4`, it asks `components/reels/managers/PlaybackManager.ts` to play.
  - If not intersecting or ratio is below `0.4`, it asks it to pause.
- On user toggle:
  - `components/reelsFeed.tsx` routes play/pause through the manager.
- On video end:
  - `components/reelsFeed.tsx` rewinds the video and calls play again to loop it.
- On cleanup/unmount:
  - `components/reels/managers/CacheManager.ts` pauses and removes the source.

### Current active video
- The intended active video is tracked by `currentVideoIndex` in `components/reels/store/reelsStore.ts`.
- The actual DOM-visible video is inferred from the intersection observer in `components/reels/managers/VisibilityManager.ts`.

### Possible race conditions
- There is a race between:
  - visibility-driven play,
  - `canplay`-driven play,
  - and pause-from-other-video logic.
- The code can issue multiple play requests for the same video, especially during rapid changes.
- `PlaybackManager.pause()` waits on an in-flight play promise, but `play()` does not cancel older play attempts. This can leave stale states behind.

### Promise rejections
- `components/reels/managers/PlaybackManager.ts` catches rejected `video.play()` promises and logs them.
- This is likely to happen on mobile browsers and blocked autoplay scenarios.

### Event order
Typical order is:
1. visibility observer fires,
2. manager requests play,
3. `video.play()` is invoked,
4. `canplay` fires and may trigger another play request,
5. store state is updated to `isPlaying=true`.

### Unexpected behaviour
- Playback is not fully controlled by a single source of truth.
- The state may drift between the store, the observer callback, and the DOM video element.
- On mobile, autoplay is likely to fail or be delayed.

---

## 3. Audio Audit

### Where `globalMuted` is stored
- In `components/reels/store/reelsStore.ts`, `globalMuted` is stored in Zustand.
- It is updated by `components/reelsFeed.tsx` through `setGlobalMuted`.

### Is AudioManager actually connected?
- Yes, it is instantiated in `components/reelsFeed.tsx`.
- It is used to toggle mute and to sync the mute state to all registered videos.

### Does every VideoPlayer register with AudioManager?
- Yes, each rendered video is registered through the ref callback in `components/reelsFeed.tsx`.
- The connection is done at the parent level, not inside `components/reels/VideoPlayer.tsx`.

### Does every VideoPlayer unregister on unmount?
- Not reliably.
- The cleanup path in `components/reelsFeed.tsx` passes `null` to the ref callback, but the audio manager's unregister method only removes a video if a non-null element is passed. This means previously mounted elements can remain tracked.

### Does mute affect all active videos?
- Mostly yes, because `components/reels/managers/AudioManager.ts` updates every registered video's `muted` property.
- However, the bookkeeping is fragile because old video elements are not always removed from the set.

### Does mute persist after swiping?
- Partially.
- The manager persists to localStorage, but the store is not initialized from that persisted value on first render. That can cause UI and actual mute state to disagree briefly.

### Any remaining local mute state?
- No `useState()`-based mute state was found in the reels tree.
- The mute state is centralized in the manager/store system.

### Can multiple videos produce sound?
- Yes, that is possible under race conditions, especially during rapid visibility changes or when multiple videos are briefly both considered active.

### Files touching mute/audio state
- `components/reels/managers/AudioManager.ts`: `muted`, `isMuted`, `toggleMute`, `setMute`, `getMuted`
- `components/reels/managers/PlaybackManager.ts`: `video.muted`
- `components/reels/store/reelsStore.ts`: `globalMuted`
- `components/reelsFeed.tsx`: `globalMuted`, `AudioManager.toggleMute()`, `AudioManager.getMuted()`
- `components/reels/ReelCard.tsx`: `isMuted` prop
- `components/reels/Overlay.tsx`: `isMuted` prop
- `components/reels/Actions.tsx`: mute icon rendering from `isMuted`

---

## 4. Gesture Audit

### Touch start / move / end / wheel / keyboard
- The container in `components/reelsFeed.tsx` is wired to `onWheel`, `onTouchStart`, `onTouchMove`, and `onTouchEnd`.
- However, the class in `components/reels/managers/GestureManager.ts` does not implement `handleWheel`, `handleTouchStart`, `handleTouchMove`, or `handleTouchEnd`.
- So the swipe handlers are effectively not doing anything.

### Verification
- One swipe does not reliably equal one reel change.
- There is no implemented swipe-to-next/previous logic.
- The only implemented keyboard controls are Space and M.
- The props `onNext` and `onPrevious` are passed into the gesture manager, but they are not used.

### CSS snap conflicts
- The list container uses CSS snapping in `components/reelsFeed.tsx`.
- This creates a browser-native scroll-snap experience that competes with custom gesture handling.
- The current custom gesture layer is not actually driving navigation.

---

## 5. Visibility Audit

### IntersectionObserver registration
- `components/reels/managers/VisibilityManager.ts` creates an observer and observes each video element.
- `components/reelsFeed.tsx` registers each video via `observe(el, index)`.

### Observer cleanup
- Cleanup is attempted through `unobserve(el)` when the ref becomes null.
- The implementation is incomplete because the audio manager cleanup is also weak, and the observer is disconnected only on feed unmount.

### Active reel calculation
- The active reel is derived from `currentVideoIndex` in the store, but the visible reel is also inferred separately from the observer.
- That creates drift when the user moves quickly.

### Play/pause trigger timing
- Play/pause is triggered when the observer callback fires.
- That timing is not coordinated with the store and the play promise lifecycle.

### Visibility threshold
- The threshold is set to `[0, 0.1, ..., 1]` in `components/reels/managers/VisibilityManager.ts`, and the code uses `ratio >= 0.4`.
- This is permissive enough that multiple videos can be considered "visible" at once.

---

## 6. Virtualization Audit

### Mounted ReelCards
- The feed renders only previous/current/next cards by checking `distance <= 1`.
- In practice, that means at most three real reel cards are mounted.

### Mounted video elements
- At most three video elements are mounted at one time.

### Placeholder rendering
- Out-of-window items render placeholder black divs instead of real cards.
- That is a lightweight virtualization strategy.

### Fast-swipe behaviour
- The virtualization approach is present, but the cleanup and observer logic are not robust enough for fast swipes.
- Refs can change quickly enough that stale registrations and stale playback state can remain active.

---

## 7. State Audit

### Zustand state variables
From `components/reels/store/reelsStore.ts`:

- `currentVideoIndex`
- `isLoading`
- `showMuteButton`
- `showComments`
- `isModalOpen`
- `globalMuted`
- `videoStates`

### Where each is created
- Created in the Zustand store initializer in `components/reels/store/reelsStore.ts`.
- Initialized from the feed in `components/reelsFeed.tsx` via `initializeVideoStates(...)`.

### Where each is read
- Read from `components/reelsFeed.tsx` and the managers through `useReelsStore.getState()`.
- Read by components such as `components/reels/ReelCard.tsx` and `components/reels/Overlay.tsx` via props.

### Where each is updated
- `setCurrentVideoIndex` and `setVideoState` are used by the feed and managers.
- `setGlobalMuted` is used by the audio manager callback.
- `setIsLoading`, `setShowMuteButton`, `setShowComments`, and `setIsModalOpen` are used by the feed.

### Remaining local `useState()` duplication
- No `useState()` calls were found in the reels tree.
- The reels UI is mostly centralized in Zustand plus local component state for comments and desktop detection in `components/reelsFeed.tsx`.

---

## 8. Component Connections

### ReelsFeed
- Parent: `app/(dashboard)/dashboard/reels/page.tsx`
- Children: `components/reels/ReelCard.tsx`, `components/reels/CommentsSheet.tsx`
- Store usage: heavy
- Managers used: Playback, Audio, Visibility, Gesture, Preload
- Broken/missing connection: swipe handlers are wired but not implemented

### ReelCard
- Parent: `components/reelsFeed.tsx`
- Children: `components/reels/VideoPlayer.tsx`, `components/reels/Overlay.tsx`
- Props: video data and UI callbacks
- Store usage: none directly
- Broken/missing connection: the `isPlaying` prop is passed but not used in rendering

### VideoPlayer
- Parent: `components/reels/ReelCard.tsx`
- Children: none
- Props: video source and click handler
- Store usage: none
- Managers used: `components/reels/managers/CacheManager.ts` for cleanup

### Overlay
- Parent: `components/reels/ReelCard.tsx`
- Children: `components/reels/Caption.tsx`, `components/reels/CreatorInfo.tsx`, `components/reels/Actions.tsx`, `components/reels/ProgressBar.tsx`
- Props: UI state and button callbacks
- Store usage: none
- Broken/missing connection: progress bar is index-based, not playback-position-based

### Actions / CreatorInfo / Caption / ProgressBar
- These are present and structurally connected.
- The main issue is not missing child wiring, but that the data they receive is sometimes incomplete or not reflective of runtime playback state.

---

## 9. Runtime Errors

### Static diagnostics
- Editor diagnostics reported no errors for the reels files.

### Runtime-risk areas seen in code
- Autoplay rejections are handled but will still surface as console log noise.
- Fullscreen requests may fail and fall back to a click listener.
- The code contains several likely browser-side issues rather than hard TypeScript errors.

### Likely runtime symptoms
- blocked autoplay on mobile,
- muted/unmuted mismatch after reload,
- duplicate play requests,
- stale audio registrations,
- swipe events doing nothing.

---

## 10. Mobile Behaviour

### Android
- Autoplay is likely unreliable because playback is triggered from observer logic rather than a user gesture.
- Audio may still be muted by the manager, but playback may be delayed or blocked.

### iPhone / Safari
- Programmatic `video.play()` is especially likely to fail without a direct user gesture.
- The current implementation is therefore vulnerable to silent playback failures.
- Fullscreen and autoplay are both likely to be inconsistent.

### Memory usage
- The virtualization is light, but cleanup is not fully reliable.
- Old video elements and listeners can remain active longer than intended.

### Loading speed
- Preloading exists, but it is limited to a small lookahead and uses `<link rel="preload">`, not actual media buffering.

---

## 11. Final Diagnosis

### Working correctly
- The overall component tree is wired and renders.
- The feed mounts only a small virtualization window.
- The store initializes state and the managers are instantiated once.
- Mute toggling is implemented and persisted to localStorage.

### Partially working
- The feed can start playback when autoplay is allowed.
- The mute UI and audio manager are mostly connected.
- The current/previous/next window is implemented.

### Broken
- Swipe gestures are not actually implemented.
- Next/previous navigation is not wired.
- Playback can be inconsistent during rapid changes.
- Multiple videos can briefly play or be incorrectly paused.
- Audio registration cleanup is incomplete.
- Mobile autoplay is likely broken.

### Root cause analysis

#### 1. Critical: swipe logic is not implemented
- **Cause:** `components/reels/managers/GestureManager.ts` does not implement the touch/wheel handlers that `components/reelsFeed.tsx` tries to call.
- **Responsible files:** 
  - `components/reelsFeed.tsx` (wiring)
  - `components/reels/managers/GestureManager.ts` (missing implementation)

#### 2. Critical: autoplay is fragile on mobile
- **Cause:** playback is started from visibility and `canplay` events, not a user gesture, and `video.play()` can reject.
- **Responsible files:** 
  - `components/reels/managers/PlaybackManager.ts` (play logic)
  - `components/reels/managers/VisibilityManager.ts` (visibility trigger)

#### 3. High: playback state races
- **Cause:** multiple play/pause paths update state without a single authoritative lifecycle.
- **Responsible files:** 
  - `components/reelsFeed.tsx` (orchestration)
  - `components/reels/managers/PlaybackManager.ts` (play/pause)
  - `components/reels/managers/VisibilityManager.ts` (visibility trigger)

#### 4. Medium: audio cleanup is incomplete
- **Cause:** old video elements are not reliably removed from the audio manager's tracking set.
- **Responsible files:** 
  - `components/reelsFeed.tsx` (cleanup invocation)
  - `components/reels/managers/AudioManager.ts` (tracking)

#### 5. Low: progress bar is misleading
- **Cause:** it reflects index rather than playback position.
- **Responsible file:** `components/reels/ProgressBar.tsx`

### Priority ranking

#### 1. Critical
- Swipe/navigation is effectively broken
- Mobile autoplay is likely broken

#### 2. High
- Playback race conditions and wrong-video activation

#### 3. Medium
- Mute state cleanup and initial sync issues

#### 4. Low
- Progress bar accuracy and cleanup polish

---

## Summary

This reels implementation is architecturally sound in structure but has significant runtime issues:

1. **Gesture layer is stubbed but not implemented** — The swipe handlers are wired but have no logic.
2. **Playback lifecycle is fragmented** — Multiple entry points (visibility, canplay, user interaction) compete without a single source of truth.
3. **Mobile autoplay is unreliable** — Relying on observer-based play calls without user gestures breaks browser autoplay policies.
4. **Audio cleanup is weak** — Old video elements can remain registered.
5. **State coordination is fragile** — The store, observer, and promise lifecycle are not synchronized.

Another engineer can use this report to prioritize fixes and understand which files to target for each issue.
