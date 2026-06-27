# 7. Scholars List (`/scholars`) — §4.1 (linked from Home)

- **Route:** `app/(public)/scholars/page.tsx`
- **Layout:** Header (back left, "Scholars" center), BottomNav
- **Sections:**
  1. Page title "Our Scholars"
  2. ScholarRow list — each row links to scholar profile
- **Empty state:** "No scholars yet. Check back soon."
- **Error state:** "Couldn't load scholars. Tap to retry."
- **Components used:** Header, BottomNav, ScholarRow, ScholarRowSkeleton