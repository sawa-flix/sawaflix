# SawaFlix UI/UX Improvement Tasks

This document outlines the priority UI/UX issues that need to be addressed to improve the user experience of the SawaFlix platform.

---

## Issue #1: Comment Box Overlay Improvement
**Current Behavior:** The comment box currently overlays directly on top of the video player, obstructing the view of the content.
**Expected Behavior:** Re-design the comment section to behave similarly to TikTok.
- On desktop, it should ideally slide out from the right side or appear in a way that maintains the video's visibility.
- On mobile, it should be a bottom sheet that can be dragged up/down.
- The video should remain visible and ideally resize or shift slightly to ensure the "action" isn't blocked by the comment UI.

## Issue #2: Video Auto-Next Logic
**Current Behavior:** When a video reaches the end, it currently loops indefinitely.
**Expected Behavior:** Implement "Up Next" logic for the feed.
- When a video finishes playing, it should automatically transition/scroll to the next video in the list.
- Add a toggle for "Auto-play next" in the settings if possible, but default should be to move to the next content.

## Issue #3: Intelligent Scroll Playback (Viewport Detection)
**Current Behavior:** When scrolling through the feed, the first video continues to play even after it has been scrolled out of view.
**Expected Behavior:** Implement Intersection Observer logic for the video feed.
- Only the video currently in the center of the viewport should be playing.
- When a user scrolls to a new video, the previous one should automatically pause and the new one should start playing.
- This will save bandwidth and provide a much smoother browsing experience.

## Issue #4: Search Results Auto-Scroll
**Current Behavior:** After performing a search, the results appear below the fold, requiring the user to manually scroll down to see that the search was successful.
**Expected Behavior:** Improve the feedback loop for search.
- Once search results are fetched and rendered, the page should automatically and smoothly scroll down to the "Results for..." section.
- This ensures the user immediately sees the content they were looking for.

---

**Note to Students:** Please ensure all changes maintain the premium dark-mode aesthetic of the platform and are fully responsive across mobile and desktop views.
