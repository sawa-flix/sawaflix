# Sawa Media Components - Architecture & Structure

## 📁 Project Structure

This document outlines the refactored architecture for the **Movie** and **Music** pages with professional separation of concerns.

### Directory Layout

```
sawa/
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           ├── movie/
│           │   └── page.tsx                 # Main Movie page (refactored)
│           │
│           └── music/
│               └── page.tsx                 # Main Music page (refactored)
│
├── components/
│   ├── Movie/
│   │   ├── MovieCard.tsx                   # Movie card component for grid
│   │   ├── MovieHeroBanner.tsx             # Featured movie hero banner
│   │   ├── RightSidebarContent.tsx         # Desktop sidebar with details
│   │   ├── MovieDetailSheet.tsx            # Mobile bottom sheet details
│   │   ├── types.ts                        # Type definitions
│   │   ├── constants.ts                    # Movie data & filters
│   │   ├── index.ts                        # Public API exports
│   │   └── README.md                       # Component documentation
│   │
│   └── Music/
│       ├── MusicCard.tsx                   # Music card component for grid
│       ├── NowPlayingSection.tsx           # Hero section with player
│       ├── MusicCategoryRow.tsx            # Horizontal scrolling category row
│       ├── types.ts                        # Type definitions
│       ├── utils.ts                        # Utility functions
│       ├── index.ts                        # Public API exports
│       └── README.md                       # Component documentation
```

## 🎯 Key Features

### Movie Page Architecture

**Components:**
- **MovieCard** - Grid-based movie card with hover effects and ratings
- **MovieHeroBanner** - Featured movie showcase with CTA buttons
- **RightSidebarContent** - Desktop sidebar showing movie details
- **MovieDetailSheet** - Mobile-friendly bottom sheet for details

**Type Safety:**
- Comprehensive TypeScript interfaces for all data structures
- Props validation with strict typing
- Constants centralized in `constants.ts`

**Features:**
- Genre-based filtering
- Responsive grid layout (2-4 columns)
- Desktop sidebar with related movies
- Mobile bottom sheet navigation
- Paywall integration
- Premium/Free badge system

### Music Page Architecture

**Components:**
- **MusicCard** - Album/video card with play overlay
- **NowPlayingSection** - Hero section with full player controls
- **MusicCategoryRow** - Horizontal scrollable category rows

**Type Safety:**
- Typed Track and MusicCategory interfaces
- Utility functions with proper typing
- Consistent prop interfaces across components

**Features:**
- Audio/Video mode toggle
- Full playback controls (play, pause, next, prev)
- Shuffle and repeat modes
- Progress bar with seek functionality
- Volume control
- Visualizer animation
- Category-based organization
- Responsive design

## 📋 Type Definitions

### Movie Types (`components/Movie/types.ts`)
```typescript
interface Movie {
  id: string;
  title: string;
  image: string;
  year: number;
  country: string;
  genres: string[];
  featured: boolean;
  description: string;
  duration?: string;
  ageRating?: string;
  rating?: number;
  director?: string;
  writer?: string;
  stars?: string;
  language?: string;
  subtitles?: string;
}
```

### Music Types (`components/Music/types.ts`)
```typescript
interface Track {
  id: string | number;
  title: string;
  artist: string;
  image: string;
  src: string;
  duration?: string;
}

interface MusicCategory {
  category: string;
  videos: Video[];
}
```

## 🔄 Data Flow

### Movie Page Flow
1. Page mounts and loads featured movie
2. User selects filter → filtered movies update
3. User clicks movie card → sidebar/sheet updates (responsive)
4. User clicks "Watch Now" → Paywall manager opens
5. Component state manages all interactions

### Music Page Flow
1. Page fetches categories from backend
2. Current track displays in hero section
3. User clicks track → playback starts with category as playlist
4. User toggles audio/video mode → player switches
5. Music context handles all playback state

## 🎨 Styling Approach

- **Tailwind CSS** for utility-based styling
- **Dark theme** (grays and blacks) with accent colors
- **Responsive breakpoints**: xs, sm, md, lg, xl
- **Smooth transitions** and hover effects
- **Custom scrollbar hiding** for horizontal scroll areas

## ♿ Accessibility Features

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support (Enter/Space)
- Proper focus management
- Color contrast ratios meet WCAG standards
- Loading states and skeletons

## 🚀 Performance Optimizations

- Lazy loading for images
- `useMemo` for filtered data
- Dynamic imports for heavy components (ReactPlayer)
- Code splitting at route level
- Optimized re-renders with proper memoization

## 📝 Best Practices Implemented

1. **Separation of Concerns**
   - Logic separated from presentation
   - Components have single responsibility
   - Custom hooks for shared logic

2. **Type Safety**
   - Full TypeScript coverage
   - No `any` types
   - Strict interface definitions

3. **Code Organization**
   - Grouped related files in component folders
   - Clear public API with index files
   - Centralized constants and utilities

4. **Component Design**
   - Reusable, composable components
   - Props drilling minimized with context
   - Clear prop interfaces

5. **Documentation**
   - JSDoc comments on components
   - Type documentation
   - README files for each feature

## 🔄 Migration Guide

### For Developers

**Old Way (JSX):**
```jsx
// Single monolithic file with everything mixed
export default function MoviePage() {
  // 500+ lines of code
  // Mixed concerns: data, UI, logic
}
```

**New Way (TypeScript):**
```tsx
// Organized, typed components
import { MovieCard, FILTERS, MOVIES_DATA } from '@/components/Movie';

export default function MoviePage(): React.ReactElement {
  // Clean, focused, ~150 lines
  // Clear separation of concerns
}
```

## 📦 Public API

### Movie Components
```typescript
export { MovieCard, RightSidebarContent, MovieDetailSheet, MovieHeroBanner }
export type { Movie, MovieCardProps, RightSidebarContentProps, MovieDetailSheetProps }
export { FILTERS, MOVIES_DATA }
```

### Music Components
```typescript
export { MusicCard, NowPlayingSection, MusicCategoryRow }
export type { Track, MusicCategory, MusicCardProps, MusicCategoryRowProps }
export { normalizeUrl, formatTime, getNextRepeatMode }
```

## 🧪 Testing Considerations

- Component props can be easily tested due to typing
- Mock data available in constants
- Utility functions are pure and testable
- Event handlers are clearly defined

## 🎯 Future Enhancements

- [ ] Add unit tests for components
- [ ] Add E2E tests for user flows
- [ ] Extract filters to context for persistence
- [ ] Add favorites management
- [ ] Implement search functionality
- [ ] Add movie/music recommendations
- [ ] Create admin dashboard for content management
- [ ] Add analytics tracking

## 📚 Resources

- [TypeScript React Components](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Patterns](https://react.dev/)

---

**Last Updated:** 2024
**Version:** 2.0 (Refactored)
**Status:** ✅ Production Ready
