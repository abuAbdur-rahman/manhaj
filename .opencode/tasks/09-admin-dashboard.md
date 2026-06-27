# 8. Admin Dashboard (`/admin`) — §4.9

- **Route:** `app/(admin)/admin/page.tsx`
- **Layout:** Header (logo left, account menu right), AdminSidebar (desktop), AdminMobileNav (mobile)
- **Sections:**
  1. Quick actions — Button "+ New episode", Button outline "+ New series"
  2. Scope indicator (scholar_admin): "Your scope: Dr. Sharafudeen" (Badge or info card)
  3. Scope summary (super_admin): scholar count, episode count, recent uploads
  4. Recent uploads — EpisodeRow list with status badges (Published ✓ / Draft)
- **Loading:** WaveformSkeleton rows
- **Empty state:** "No episodes yet. Create your first episode."
- **Error state:** "Couldn't load dashboard. Tap to retry."
- **Components used:** Header, AdminSidebar, AdminMobileNav, Button, Badge, EpisodeRow, WaveformSkeleton, EmptyState