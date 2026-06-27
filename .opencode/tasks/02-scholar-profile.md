# 2. Scholar Profile (`/scholars/[slug]`) — §4.2

- **Route:** `app/(public)/scholars/[slug]/page.tsx`
- **Layout:** Header (back left, scholar name center)
- **Sections:**
  1. Header — Avatar (96px), WaveformSeal watermark behind photo, scholar name (display), Badge list (languages), bio (2 lines + "Read more"), social links (Button ghost)
  2. Tabs: [Series] [All Episodes] — Radix Tabs
  3. Series tab: 2-col grid of `SeriesCard` + `SeriesCardSkeleton` (loading)
  4. All Episodes tab: list of `EpisodeRow` + `WaveformSkeleton` (loading)
- **Empty state:** "No series yet. Check back soon."
- **Error state:** "Couldn't load this scholar's content. Tap to retry."
- **Components used:** Header, Avatar, Badge, WaveformSeal (watermark), Tabs, SeriesCard, SeriesCardSkeleton, EpisodeRow, WaveformSkeleton, Button