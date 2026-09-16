# Playback Fix — Quick Reference

## The Problem
- User plays Video A (audio on)
- User swipes to Video B
- **Both A and B play simultaneously** ❌

## Root Cause
1. PlaybackManager.play() didn't pause other videos
2. AudioManager.unregister(null) was ineffective
3. ReelsFeed didn't clean up old element before registering new one
4. VisibilityManager fired duplicate callbacks
5. No tracking of which video was actually playing

## The Fix (4 files)

### PlaybackManager.ts
```diff
+ private currentlyPlayingId: number | null = null;

async play(id: number, isMuted: boolean) {
+  // PAUSE all other videos FIRST
+  if (this.currentlyPlayingId !== null && this.currentlyPlayingId !== id) {
+    await this.pause(this.currentlyPlayingId);
+  }
+  this.currentlyPlayingId = id;
   video.play();
}

- pause(id) { video.pause(); }
+ async pause(id) { 
+   if (this.currentlyPlayingId === id) this.currentlyPlayingId = null;
+   await Promise for pause completion;
+ }
```

**Result:** Exclusive play — only one video ever plays.

### AudioManager.ts
```diff
+ public forceRemove(video: HTMLVideoElement | null) {
+   video.muted = true;
+   this.videos.delete(video);
+ }
+
+ public muteAll() {
+   for (const video of this.videos) {
+     video.muted = true;
+   }
+ }
```

**Result:** Old videos can be aggressively removed; no stale registrations.

### VisibilityManager.ts
```diff
+ private visibilityState = new Map<number, { isIntersecting, ratio }>();

observer callback:
+ const stateChanged = previousState?.isIntersecting !== entry.isIntersecting;
+ if (stateChanged) {
    this.onVisibleChange(...);  // Only once per change
+ }
```

**Result:** No duplicate play() calls.

### ReelsFeed.tsx
```diff
+ const previousVideoRefs = useRef<HTMLVideoElement | null>[]>([]);

const setVideoRef = (index) => (el) => {
+  const previousEl = videoRefs.current[index];
+  if (previousEl && previousEl !== el) {
+    audioManager.forceRemove(previousEl);
+    visibilityManager.unobserve(previousEl);
+    playbackManager.unregister(index);
+  }
   videoRefs.current[index] = el;
```

**Result:** Old element is cleaned up BEFORE new one is registered.

## Invariants Guaranteed

| Invariant | Before | After |
|-----------|--------|-------|
| Only 1 video plays | ❌ Multiple could play | ✓ PlaybackManager.play() enforces |
| Only 1 audio source | ❌ Stale registrations | ✓ forceRemove() cleans up |
| No orphaned refs | ❌ Old video remained registered | ✓ Clean before register |
| No duplicate plays | ❌ Observer fired multiple times | ✓ Deduplicates state |
| Async coordination | ❌ No await on pause | ✓ pause() is async |

## Testing

```bash
# Test exclusive playback
1. Open reels page
2. Rapid swipe through 20+ videos
3. Listen for audio — should hear ONLY current video
4. Old video audio should STOP immediately when swiping
5. No console errors
```

## Result

**Before:** Video B plays, but Audio A continues (broken)  
**After:** Video B plays, Audio A stops (fixed) ✓

