# 1. Home (`/`) — §4.1

- **Route:** `app/(public)/page.tsx`
- **Layout:** Header (logo left, search icon right), BottomNav
- **Sections:**
  1. Recently added — horizontal scroll of `EpisodeCard` + `EpisodeCardSkeleton` (loading state)
  2. Featured series — single `FeaturedSeriesCard` + `FeaturedSeriesCardSkeleton` (loading state)
  3. Scholars list — `ScholarRow` rows + `ScholarRowSkeleton` (loading state), "See all scholars" link
- **Empty state:** N/A (static sections, hide if no data)
- **Error state:** each section independently — "Couldn't load recent lectures. Tap to retry."
- **Components used:** Header, BottomNav, EpisodeCard, EpisodeCardSkeleton, FeaturedSeriesCard, FeaturedSeriesCardSkeleton, ScholarRow, ScholarRowSkeleton