# 6. Downloads (`/downloads`) — §4.7

- **Route:** `app/(public)/downloads/page.tsx`
- **Layout:** Header (title left, storage usage right), BottomNav
- **Sections:**
  1. Storage header — "2.1 GB used" (Caption mono)
  2. DownloadRow list — each with title, duration, downloaded date, delete (🗑) button
- **Empty state:** EmptyState — "Nothing downloaded yet. Tap ⬇ on any lecture to listen without data."
- **Error state:** "Couldn't load downloads. Tap to retry."
- **Components used:** Header, BottomNav, DownloadRow, EmptyState