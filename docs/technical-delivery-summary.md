# SawaFlix movie flow, splash, and payment delivery summary

Branch name: `feat/movie-flow-payment-splash`

## Overview
This delivery covers the movie detail flow, the once-per-session splash loader, and the premium checkout handoff for the app frontend. The goal was to fix the in-page movie switching behavior, keep the app loading experience polished in both themes, and provide a structured payment-modal flow without pretending the backend payment engine is already live.

## What was improved

### 1) Movie detail view no longer reloads the whole page
The route-level issue was caused by the detail page treating a different movie as a full route navigation event instead of just a local view change. The code previously relied on client-side route updates on the same dynamic page, which triggered broader routing churn than needed. The fix keeps the URL synchronized with `window.history.pushState` while the component state changes locally, so the dashboard shell and surrounding layout remain stable while the active movie content swaps in-place.

### 2) Watch-now CTA is light-themed in both interfaces
The primary action now uses a light elevated button treatment instead of a red emphasis, keeping it readable in light and dark themes without losing contrast.

### 3) Splash screen is session-based and respects reduced motion
The app loader now shows once per browser session, tracks real app-load progress, eases toward 90% during the final stages of the load, and fades out cleanly when the app is ready. It includes a retry button if the app takes longer than expected and respects `prefers-reduced-motion` for accessibility.

### 4) Payment modal is structured around actual access tiers
The premium preview flow now surfaces the correct plan structure:
- 1 day rental: 250 XAF
- 1 week rental: 500 XAF
- Lifetime: 1500 XAF
The flow intentionally shows a loading state and then transitions to a “Coming soon” confirmation screen so the UX is complete without faking a live payment result before the backend is ready.

## Changed pages and components

### App shell
- `app/layout.tsx`
  - Keeps the app-wide loader mounted from the root layout.
  - Includes the session-scoped splash screen and app-ready event wiring.

### Splash experience
- `components/PWASplashScreen.tsx`
  - Added a session guard so the splash only shows once per session.
  - Uses real DOM/font/image readiness metrics to drive progress.
  - Includes a timeout fallback and retry action.
  - Respects reduced-motion preferences and fades out smoothly.

### Movie detail page
- `app/(dashboard)/dashboard/movie/[id]/page.tsx`
  - Uses in-place selection logic so changing titles inside the same route does not cause a full page reload.
  - Keeps `selectedRouteId` and URL state synchronized without forcing a reload of the dashboard shell.
  - Preserves resume progress and premium gating logic when the selected title changes.

### Player and premium flow
- `components/Movie/MovieVideoPlayer.tsx`
  - Keeps resume progress and premium preview handling aligned with the movie detail state.
- `components/Movie/PremiumPreviewCheckout.tsx`
  - Added plan selection for day/week/lifetime pricing.
  - Added the payment loading state and the “Coming soon” confirmation step.
  - Kept the flow honest: no fake checkout success is reported before backend integration.
- `components/Movie/movieProgress.ts`
  - Continues to store local resume progress for movies and episodes.

### Sidebar and related data
- `components/Dashboard/rightsidebar.jsx`
  - Triggers in-page movie selection when the user opens a related title while already on the movie detail route.
- `components/Movie/MovieCard.tsx`
  - Supports the route-local movie selection experience cleanly.

## Notes for the team
- The payment backend is intentionally not simulated as a real success path. The frontend is prepared for the backend connection, but the final transaction confirmation remains intentionally deferred.
- The movie route fix is a client-side UX fix rather than a hard route reload. The app shell remains mounted while the active movie object changes.
- The splash and pricing flows are ready to be wired to production backend services when the final payment and asset pipeline are released.
