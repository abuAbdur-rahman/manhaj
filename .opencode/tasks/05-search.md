# 5. Search (`/search`) — §4.6

- **Route:** `app/(public)/search/page.tsx`
- **Layout:** Header (back left, SearchInput inline), BottomNav
- **Sections:**
  1. SearchInput — auto-focused, debounced 300ms
  2. Filter chips — Chip (language: Yoruba, English, Arabic), multi-select
  3. Results — EpisodeRow list, 300ms debounced
  4. Loading: WaveformSkeleton rows
- **Empty state (no query):** "Search by scholar, series, or topic — try 'Aqeedah'."
- **Empty state (no results):** "Nothing found for '___'. Try a scholar's name or a topic like Fiqh."
- **Error state:** "Search failed. Try again."
- **Components used:** Header, BottomNav, SearchInput, Chip, EpisodeRow, EmptyState, WaveformSkeleton